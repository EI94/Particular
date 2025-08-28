import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default async function PayPage({ params }: { params: Promise<{ id: string }>}) {
  const { id } = await params;
  
  // Get payment data
  const snap = await getDoc(doc(db, "payments", id));
  if (!snap.exists()) {
    return <div style={{padding:24}}>Pagamento non trovato.</div>;
  }
  
  const payment = { id: snap.id, ...snap.data() } as any;

  return (
    <div style={{maxWidth:520, margin:"48px auto", fontFamily:"ui-sans-serif"}}>
      <h1>Pagamento {payment.id}</h1>
      <p>Importo: € {payment.amount || 'N/A'}</p>
      <p>Scadenza: {payment.dueDate || 'N/A'}</p>
      <p>Stato: {payment.status || 'N/A'}</p>
      {payment.status !== "paid" && (
        <div style={{marginTop:12}}>
          <p>Questo è un componente server-side. Per le azioni interattive, usa il dashboard.</p>
        </div>
      )}
    </div>
  );
}
