"use client";

import { useEffect } from 'react';

export default function StripeTest() {
  useEffect(() => {
    // Test di importazione dinamica di Stripe
    const testStripe = async () => {
      try {
        // Importazione dinamica per evitare problemi SSR
        const Stripe = (await import('stripe')).default;
        console.log('✅ Stripe importato correttamente:', typeof Stripe);
        
        // Test di creazione istanza (solo per test)
        if (typeof Stripe === 'function') {
          console.log('✅ Stripe è una funzione costruttore valida');
        }
      } catch (error) {
        console.error('❌ Errore nell\'importazione di Stripe:', error);
      }
    };

    testStripe();
  }, []);

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-semibold mb-2">Test Stripe</h3>
      <p className="text-sm text-gray-600">
        Controlla la console del browser per vedere se Stripe è importato correttamente
      </p>
    </div>
  );
}
