// Costanti del sistema di gestione immobiliare

// Stati delle unità
export const UNIT_STATUSES = {
  VACANT: "vacant",
  OCCUPIED: "occupied",
  MAINTENANCE: "maintenance",
  RESERVED: "reserved",
} as const;

// Stati dei pagamenti
export const PAYMENT_STATUSES = {
  PENDING: "pending",
  PAID: "paid",
  LATE: "late",
  FAILED: "failed",
  OVERDUE: "overdue",
} as const;

// Stati dei contratti
export const LEASE_STATUSES = {
  ACTIVE: "active",
  EXPIRED: "expired",
  TERMINATED: "terminated",
  PENDING: "pending",
} as const;

// Metodi di pagamento
export const PAYMENT_METHODS = {
  SEPA_MANDATE: "SEPA_MANDATE",
  MANUAL: "MANUAL",
} as const;

// Tipi di asset
export const ASSET_TYPES = {
  BOILER: "boiler",
  AC: "ac",
  EXTINGUISHER: "extinguisher",
  OTHER: "other",
} as const;

// Provider di pagamento
export const PAYMENT_PROVIDERS = {
  MOCK: "MOCK",
  SEPA: "SEPA",
} as const;

// Eventi webhook
export const WEBHOOK_EVENTS = {
  PAYMENT_RECEIVED: "payment.received",
  PAYMENT_FAILED: "payment.failed",
  LEASE_CREATED: "lease.created",
  LEASE_EXPIRED: "lease.expired",
  UNIT_STATUS_CHANGED: "unit.status_changed",
  TENANT_ADDED: "tenant.added",
  TENANT_REMOVED: "tenant.removed",
} as const;

// Limiti di paginazione
export const PAGINATION_LIMITS = {
  SMALL: 10,
  MEDIUM: 25,
  LARGE: 50,
  XLARGE: 100,
} as const;

// Formati di esportazione
export const EXPORT_FORMATS = {
  CSV: "csv",
  XLSX: "xlsx",
  PDF: "pdf",
} as const;

// Valute supportate
export const SUPPORTED_CURRENCIES = {
  EUR: "EUR",
  USD: "USD",
  GBP: "GBP",
} as const;

// Lingue supportate
export const SUPPORTED_LANGUAGES = {
  IT: "it",
  EN: "en",
  DE: "de",
  FR: "fr",
} as const;

// Configurazione date
export const DATE_CONFIG = {
  DEFAULT_DUE_DAY: 1,
  MIN_DUE_DAY: 1,
  MAX_DUE_DAY: 28,
  DATE_FORMAT: "YYYY-MM-DD",
  DISPLAY_FORMAT: "DD/MM/YYYY",
} as const;

// Configurazione notifiche
export const NOTIFICATION_CONFIG = {
  PAYMENT_REMINDER_DAYS: 7,
  LEASE_EXPIRY_WARNING_DAYS: 30,
  CERTIFICATION_WARNING_DAYS: 60,
} as const;

// Configurazione file upload
export const FILE_UPLOAD_CONFIG = {
  MAX_SIZE_MB: 10,
  ALLOWED_TYPES: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  MAX_FILES_PER_UNIT: 20,
} as const;

// Configurazione sicurezza
export const SECURITY_CONFIG = {
  PASSWORD_MIN_LENGTH: 8,
  SESSION_TIMEOUT_MINUTES: 60,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,
} as const;

// Configurazione email
export const EMAIL_CONFIG = {
  FROM_ADDRESS: "noreply@particular.com",
  FROM_NAME: "Particular - Gestione Immobiliare",
  REPLY_TO: "support@particular.com",
} as const;

// Configurazione SEPA
export const SEPA_CONFIG = {
  MANDATE_EXPIRY_DAYS: 365,
  MIN_AMOUNT: 0.01,
  MAX_AMOUNT: 999999.99,
  CURRENCY: "EUR",
} as const;

// Messaggi di errore comuni
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: "Campo obbligatorio",
  INVALID_EMAIL: "Email non valida",
  INVALID_PHONE: "Numero di telefono non valido",
  INVALID_DATE: "Data non valida",
  INVALID_AMOUNT: "Importo non valido",
  FILE_TOO_LARGE: "File troppo grande",
  FILE_TYPE_NOT_ALLOWED: "Tipo di file non consentito",
  UNAUTHORIZED: "Non autorizzato",
  NOT_FOUND: "Non trovato",
  SERVER_ERROR: "Errore del server",
} as const;

// Messaggi di successo comuni
export const SUCCESS_MESSAGES = {
  CREATED: "Creato con successo",
  UPDATED: "Aggiornato con successo",
  DELETED: "Eliminato con successo",
  SAVED: "Salvato con successo",
  UPLOADED: "Caricato con successo",
  SENT: "Inviato con successo",
} as const;
