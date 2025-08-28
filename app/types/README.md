# TypeScript Types

Questo modulo contiene tutti i tipi TypeScript per il sistema di gestione immobiliare "Particular".

## Struttura

```
types/
├── models.ts      # Modelli di dominio principali
├── utils.ts       # Tipi di utilità e helper
├── api.ts         # Tipi per API e comunicazione
└── index.ts       # Esportazioni centralizzate
```

## Modelli Principali

### Owner
Rappresenta il proprietario di immobili con informazioni di base.

### Unit
Rappresenta un'unità immobiliare (appartamento, casa, ufficio) con dettagli fisici e commerciali.

### Tenant
Rappresenta un inquilino con informazioni di contatto.

### Lease
Rappresenta un contratto di affitto con termini e condizioni.

### Payment
Rappresenta un pagamento di affitto con stato e dettagli transazionali.

### Asset
Rappresenta beni e certificazioni dell'immobile (caldaia, condizionatore, estintore).

## Tipi di Utilità

- **Status Types**: Stati per unità, pagamenti e contratti
- **Form Types**: Tipi per form di creazione e modifica
- **Filter Types**: Tipi per filtri di ricerca
- **Dashboard Types**: Statistiche e metriche
- **Notification Types**: Sistema di notifiche

## Tipi API

- **Response Types**: Strutture standard per le risposte API
- **Pagination**: Gestione della paginazione
- **CRUD Operations**: Operazioni di creazione, lettura, aggiornamento, eliminazione
- **File Upload**: Gestione upload file
- **Webhooks**: Eventi e payload per integrazioni

## Utilizzo

```typescript
import { Unit, CreateUnitForm, ApiResponse } from '@/types';

// Creare un nuovo immobile
const newUnit: CreateUnitForm = {
  ownerId: 'owner123',
  address: 'Via Roma 123',
  city: 'Milano',
  rooms: 3,
  m2: 80,
  rentAsk: 1200
};

// Tipizzare una risposta API
const response: ApiResponse<Unit> = await api.createUnit(newUnit);
```

## Convenzioni

- Tutti i tipi sono esportati da `index.ts`
- I tipi di creazione usano `Omit` per rimuovere campi auto-generati
- I tipi di aggiornamento usano `Partial` per rendere opzionali i campi
- I timestamp usano `any` per compatibilità con Firestore
- Gli ID sono sempre di tipo `string`
