"use client";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export default function PayPage({ params }: { params: { id: string }}) {
  const { id } = params;
  const [loading, setLoading] = useState(true);
  const [payment, setPayment]: any = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, "payments", id));
      if (snap.exists()) setPayment({ id: snap.id, ...snap.data() });
      setLoading(false);
    })();
  }, [id]);

  async function markPaid() {
    if (!confirm("Segna come pagato? (MVP)")) return;
    await updateDoc(doc(db, "payments", id), {
      status: "paid",
      paidAt: serverTimestamp(),
      provider: "MOCK",
      txRef: `TX-${Math.random().toString(36).slice(2,10)}`
    });
    setMsg("Pagamento marcato come pagato (MVP).");
  }

  async function payWithStripe() {
    setMsg("Creo sessione di pagamento…");
    // ⚠️ Configura NEXT_PUBLIC_API_BASE_URL in .env.local per produzione
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
    const res = await fetch(`${apiBase}/payments/${id}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setMsg(data.error || "Errore creazione sessione");
    }
  }

  if (loading) return <div style={{padding:24}}>Caricamento…</div>;
  if (!payment) return <div style={{padding:24}}>Pagamento non trovato.</div>;

  return (
    <div style={{maxWidth:520, margin:"48px auto", fontFamily:"ui-sans-serif"}}>
      <h1>Pagamento {payment.id}</h1>
      <p>Importo: € {payment.amount}</p>
      <p>Scadenza: {payment.dueDate}</p>
      <p>Stato: {payment.status}</p>
      {payment.status !== "paid" && (
        <>
          <button onClick={markPaid} style={{marginTop:12, marginRight:8}}>Segna come pagato (MVP)</button>
          <button onClick={payWithStripe} style={{marginTop:12}}>Paga con carta (Stripe)</button>
        </>
      )}
      <p>{msg}</p>
    </div>
  );
}
