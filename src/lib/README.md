# Libreria del Sistema

Questo modulo contiene tutte le funzioni e utilità per il sistema di gestione immobiliare "Particular".

## Struttura

```
lib/
├── firebase.ts      # Configurazione e inizializzazione Firebase
├── firestore.ts     # Operazioni Firestore per tutti i modelli
├── utils.ts         # Funzioni di utilità generali
├── constants.ts     # Costanti e configurazioni del sistema
└── index.ts         # Esportazioni centralizzate
```

## Firebase

### Configurazione
Il sistema utilizza Firebase per:
- **Firestore**: Database NoSQL per i dati
- **Authentication**: Gestione utenti e autenticazione
- **Storage**: Archiviazione file e documenti

### Setup
1. Crea un progetto Firebase
2. Copia `firebase.config.example.ts` in `firebase.config.ts`
3. Inserisci le tue credenziali Firebase
4. Abilita Firestore, Auth e Storage nel console Firebase

## Firestore

### Operazioni Supportate

#### Owner (Proprietari)
- `upsertOwner()`: Crea/aggiorna proprietario
- `getOwner()`: Recupera proprietario per ID

#### Unit (Unità Immobiliari)
- `createUnit()`: Crea nuova unità
- `getUnit()`: Recupera unità per ID
- `getUnitsByOwner()`: Lista unità di un proprietario
- `updateUnit()`: Aggiorna unità
- `deleteUnit()`: Elimina unità

#### Tenant (Inquilini)
- `createTenant()`: Crea nuovo inquilino
- `getTenant()`: Recupera inquilino per ID
- `getTenantsByOwner()`: Lista inquilini di un proprietario
- `updateTenant()`: Aggiorna inquilino
- `deleteTenant()`: Elimina inquilino

#### Lease (Contratti)
- `createLease()`: Crea nuovo contratto
- `getLease()`: Recupera contratto per ID
- `getLeasesByUnit()`: Lista contratti di un'unità
- `getActiveLease()`: Contratto attivo di un'unità
- `updateLease()`: Aggiorna contratto
- `terminateLease()`: Termina contratto

#### Payment (Pagamenti)
- `createPayment()`: Crea nuovo pagamento
- `getPayment()`: Recupera pagamento per ID
- `getPaymentsByLease()`: Lista pagamenti di un contratto
- `getPendingPayments()`: Pagamenti in attesa di un proprietario
- `updatePaymentStatus()`: Aggiorna stato pagamento

#### Asset (Beni)
- `createAsset()`: Crea nuovo bene
- `getAssetsByUnit()`: Lista beni di un'unità
- `updateAsset()`: Aggiorna bene

### Operazioni Batch
- `createUnitWithAssets()`: Crea unità con beni in una transazione

### Listener in Tempo Reale
- `subscribeToUnit()`: Ascolta cambiamenti di un'unità
- `subscribeToPayments()`: Ascolta cambiamenti dei pagamenti

## Utilità

### Formattazione
- `formatCurrency()`: Formattazione valuta italiana
- `formatDate()`: Formattazione date italiane
- `formatShortDate()`: Formattazione date brevi

### Calcoli
- `getDaysRemaining()`: Giorni rimanenti fino a una data
- `getNextDueDate()`: Prossima data di scadenza affitto
- `calculateTotalArea()`: Area totale delle unità
- `calculateTotalRent()`: Reddito totale da affitti
- `calculateOccupancyRate()`: Tasso di occupazione

### Validazione
- `isValidEmail()`: Validazione email
- `isValidItalianPhone()`: Validazione telefono italiano

### Filtri e Ordinamento
- `filterUnits()`: Filtra unità per criteri
- `sortUnits()`: Ordina unità per campo
- `calculateDashboardStats()`: Calcola statistiche dashboard

### Firestore
- `fromFirestoreTimestamp()`: Converte timestamp Firestore
- `toFirestoreTimestamp()`: Converte a timestamp Firestore

## Costanti

### Stati
- `UNIT_STATUSES`: Stati delle unità (vacant, occupied, maintenance, reserved)
- `PAYMENT_STATUSES`: Stati dei pagamenti (pending, paid, late, failed, overdue)
- `LEASE_STATUSES`: Stati dei contratti (active, expired, terminated, pending)

### Configurazioni
- `DATE_CONFIG`: Configurazione date e scadenze
- `NOTIFICATION_CONFIG`: Configurazione notifiche
- `FILE_UPLOAD_CONFIG`: Configurazione upload file
- `SECURITY_CONFIG`: Configurazione sicurezza
- `SEPA_CONFIG`: Configurazione pagamenti SEPA

### Messaggi
- `ERROR_MESSAGES`: Messaggi di errore comuni
- `SUCCESS_MESSAGES`: Messaggi di successo comuni

## Utilizzo

```typescript
import { 
  createUnit, 
  getUnitsByOwner, 
  formatCurrency, 
  UNIT_STATUSES 
} from '@/src/lib';

// Crea una nuova unità
const unitId = await createUnit({
  ownerId: 'owner123',
  address: 'Via Roma 123',
  city: 'Milano',
  rooms: 3,
  m2: 80,
  rentAsk: 1200,
  status: UNIT_STATUSES.VACANT
});

// Recupera unità del proprietario
const units = await getUnitsByOwner('owner123');

// Formatta valuta
const formattedRent = formatCurrency(1200); // "1.200,00 €"
```

## Best Practices

1. **Gestione Errori**: Usa try-catch per tutte le operazioni Firestore
2. **Tipizzazione**: Usa sempre i tipi TypeScript definiti
3. **Batch Operations**: Usa operazioni batch per operazioni multiple
4. **Real-time**: Usa listener per dati che cambiano frequentemente
5. **Validazione**: Valida sempre i dati prima di salvarli
6. **Sicurezza**: Configura le regole Firestore correttamente
