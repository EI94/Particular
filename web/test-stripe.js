// Test file per verificare l'importazione di Stripe
import Stripe from 'stripe';
// Test di importazione
console.log('Stripe importato correttamente:', typeof Stripe);
// Test di creazione istanza (solo per test, non per produzione)
try {
    // Questo è solo un test di importazione, non creiamo realmente un'istanza
    const stripeType = Stripe;
    console.log('✅ Stripe è correttamente importabile');
    console.log('📦 Versione Stripe disponibile');
}
catch (error) {
    console.error('❌ Errore nell\'importazione di Stripe:', error);
}
