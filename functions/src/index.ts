import express from "express";
import cors from "cors";
import { Firestore } from "@google-cloud/firestore";
import Stripe from "stripe";

const db = new Firestore();

// ⚠️ Impostiamo Stripe con secret key via env (la metterai su Cloud Run)
// In locale, se non c'è la chiave, creiamo un'istanza mock
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-07-30.basil",
    })
  : null;

const app = express();
app.use(cors());
app.use(express.json());

// Healthcheck
app.get("/healthz", (_req, res) => res.send("ok"));

// Util per data ISO oggi in Europa/Roma (MVP: usiamo locale server)
function isoToday() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Genera payments "pending" oggi per i leases con dueDay == oggi
app.post("/cron/payments/due", async (_req, res) => {
  try {
    const today = new Date();
    const dueDay = today.getDate();
    if (dueDay > 28) return res.json({ skipped: true, reason: "we only support 1..28 in MVP" });

    const leasesSnap = await db.collection("leases")
      .where("dueDay", "==", dueDay)
      .get();

    let created = 0;
    for (const leaseDoc of leasesSnap.docs) {
      const lease = leaseDoc.data() as any;
      const dueDate = isoToday();

      // verifica se esiste già un payment "pending" per questo lease e questo mese
      const ps = await db.collection("payments")
        .where("leaseId", "==", leaseDoc.id)
        .where("dueDate", "==", dueDate)
        .get();

      if (!ps.empty) continue;

                    const payRef = await db.collection("payments").add({
                leaseId: leaseDoc.id,
                amount: lease.rent,
                dueDate,
                status: "pending",
                provider: lease.paymentMethod === "SEPA_MANDATE" ? "SEPA" : "MOCK",
                createdAt: new Date(),
              });

              // crea log notifica (MVP)
              await db.collection("notifications").add({
                type: "payment-reminder",
                leaseId: leaseDoc.id,
                paymentId: payRef.id,
                to: lease.tenantEmail || null,
                message: `Gentile promemoria: affitto in scadenza il ${dueDate}`,
                createdAt: new Date()
              });
      created++;
    }

    res.json({ ok: true, created });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Webhook MOCK: marca payment come pagato (per futuri provider)
app.post("/webhook/payments", async (req, res) => {
  try {
    const { paymentId, txRef } = req.body || {};
    if (!paymentId) return res.status(400).json({ error: "paymentId required" });

    await db.collection("payments").doc(paymentId).update({
      status: "paid",
      paidAt: new Date(),
      txRef: txRef || `TX-${Math.random().toString(36).slice(2,10)}`
    });
    res.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Crea una sessione Stripe Checkout per un payment Firestore esistente
app.post("/payments/:id/checkout", async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    const paymentId = req.params.id;
    const payDoc = await db.collection("payments").doc(paymentId).get();
    if (!payDoc.exists) return res.status(400).json({ error: "Payment not found" });

    const payment = payDoc.data() as any;
    if (payment.status === "paid") {
      return res.status(400).json({ error: "Payment already paid" });
    }

    // Importo in centesimi (Stripe usa int)
    const amountCents = Math.round(Number(payment.amount) * 100);

    // URLs: usa quello del tuo web su Cloud Run
    const WEB_URL = process.env.WEB_BASE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"], // MVP veloce; poi aggiungiamo sepa_debit
      line_items: [{
        price_data: {
          currency: "eur",
          unit_amount: amountCents,
          product_data: {
            name: `Affitto ${payment.dueDate}`,
          },
        },
        quantity: 1,
      }],
      metadata: {
        paymentId,
        leaseId: payment.leaseId || "",
      },
      success_url: `${WEB_URL}/pay/${paymentId}?status=success`,
      cancel_url: `${WEB_URL}/pay/${paymentId}?status=cancel`,
    });

    return res.json({ url: session.url });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

// Stripe webhook: aggiorna Firestore quando il pagamento è completato
app.post("/webhook/stripe", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

  let event: Stripe.Event;

  try {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }
    
    if (!sig || !endpointSecret) {
      // In dev, se non hai ancora il webhook secret, accetta senza verifica (MVP)
      event = req.body as any;
    } else {
      event = stripe.webhooks.constructEvent(req.body, sig as string, endpointSecret);
    }
  } catch (err: any) {
    console.error("Webhook signature verification failed", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentId = session.metadata?.paymentId;
      const txRef = session.payment_intent?.toString() || session.id;

      if (paymentId) {
        await db.collection("payments").doc(paymentId).update({
          status: "paid",
          paidAt: new Date(),
          provider: "STRIPE",
          txRef
        });
      }
    }
    // Puoi gestire altri eventi se vuoi (payment_intent.succeeded, ecc.)
    res.json({ received: true });
  } catch (e: any) {
    console.error(e);
    res.status(500).send("Webhook handler error");
  }
});

const port = process.env.PORT || 8080;

// Gestione robusta dell'avvio server con fallback porta
const server = app.listen(port, () => {
  console.log(`🚀 API listening on port ${port}`);
  console.log(`📡 Health check: http://localhost:${port}/healthz`);
  console.log(`💳 Stripe webhook: http://localhost:${port}/webhook/stripe`);
  console.log(`⏰ CRON payments: http://localhost:${port}/cron/payments/due`);
}).on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Porta ${port} già in uso. Prova con una porta diversa:`);
    console.error(`   PORT=8081 pnpm dev`);
    process.exit(1);
  } else {
    console.error('❌ Errore avvio server:', err.message);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM ricevuto, chiusura server...');
  server.close(() => {
    console.log('✅ Server chiuso correttamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT ricevuto, chiusura server...');
  server.close(() => {
    console.log('✅ Server chiuso correttamente');
    process.exit(0);
  });
});
