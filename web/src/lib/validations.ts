import { z } from "zod"

// Schemi di validazione per l'autenticazione
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'email è obbligatoria")
    .email("Inserisci un'email valida"),
  password: z
    .string()
    .min(1, "La password è obbligatoria")
    .min(6, "La password deve essere di almeno 6 caratteri"),
})

export const signupSchema = z.object({
  name: z
    .string()
    .min(1, "Il nome è obbligatorio")
    .min(2, "Il nome deve essere di almeno 2 caratteri"),
  email: z
    .string()
    .min(1, "L'email è obbligatoria")
    .email("Inserisci un'email valida"),
  password: z
    .string()
    .min(1, "La password è obbligatoria")
    .min(6, "La password deve essere di almeno 6 caratteri")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "La password deve contenere almeno una lettera minuscola, una maiuscola e un numero"
    ),
  confirmPassword: z
    .string()
    .min(1, "Conferma la password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non coincidono",
  path: ["confirmPassword"],
})

// Schemi per l'onboarding
export const ownerSchema = z.object({
  name: z
    .string()
    .min(1, "Il nome è obbligatorio")
    .min(2, "Il nome deve essere di almeno 2 caratteri"),
})

export const unitSchema = z.object({
  address: z
    .string()
    .min(1, "L'indirizzo è obbligatorio")
    .min(5, "Inserisci un indirizzo completo"),
  city: z
    .string()
    .optional(),
  rooms: z
    .number()
    .min(1, "Il numero di stanze deve essere almeno 1")
    .max(20, "Il numero di stanze non può superare 20")
    .int("Il numero di stanze deve essere un numero intero"),
  m2: z
    .number()
    .min(10, "La superficie deve essere almeno 10 m²")
    .max(1000, "La superficie non può superare 1000 m²"),
  rentAsk: z
    .number()
    .min(100, "Il canone deve essere almeno 100€")
    .max(10000, "Il canone non può superare 10.000€"),
})

export const tenantSchema = z.object({
  name: z
    .string()
    .min(1, "Il nome dell'inquilino è obbligatorio")
    .min(2, "Il nome deve essere di almeno 2 caratteri"),
  email: z
    .string()
    .min(1, "L'email dell'inquilino è obbligatoria")
    .email("Inserisci un'email valida"),
  phone: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone) return true
      const phoneRegex = /^(\+39|0039)?[ ]?[0-9]{3}[ ]?[0-9]{3}[ ]?[0-9]{4}$/
      return phoneRegex.test(phone.replace(/\s/g, ""))
    }, "Inserisci un numero di telefono italiano valido"),
})

export const leaseSchema = z.object({
  rent: z
    .number()
    .min(100, "Il canone deve essere almeno 100€")
    .max(10000, "Il canone non può superare 10.000€"),
  dueDay: z
    .number()
    .min(1, "Il giorno di scadenza deve essere tra 1 e 28")
    .max(28, "Il giorno di scadenza deve essere tra 1 e 28")
    .int("Il giorno deve essere un numero intero"),
  paymentMethod: z
    .enum(["SEPA_MANDATE", "MANUAL"], {
      required_error: "Seleziona un metodo di pagamento",
    }),
  iban: z
    .string()
    .optional()
    .refine((iban) => {
      if (!iban) return true
      // Validazione IBAN italiana semplificata
      const ibanRegex = /^IT\d{2}[A-Z]\d{3}\d{4}\d{12}$/
      return ibanRegex.test(iban.replace(/\s/g, ""))
    }, "Inserisci un IBAN italiano valido (es: IT60 X054 2811 1010 0000 0123 456)"),
  startDate: z
    .string()
    .min(1, "La data di inizio è obbligatoria")
    .refine((date) => {
      const parsedDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return parsedDate >= today
    }, "La data di inizio non può essere nel passato"),
})

// Schema completo per l'onboarding (tutti i step insieme)
export const onboardingSchema = z.object({
  owner: ownerSchema,
  unit: unitSchema,
  tenant: tenantSchema,
  lease: leaseSchema,
})

// Schemi per il pagamento
export const paymentUpdateSchema = z.object({
  status: z.enum(["pending", "paid", "late", "failed"], {
    required_error: "Lo stato del pagamento è obbligatorio",
  }),
  txRef: z.string().optional(),
  notes: z.string().optional(),
})

// Schema per il reset password
export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "L'email è obbligatoria")
    .email("Inserisci un'email valida"),
})

// Tipi TypeScript derivati dagli schemi
export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
export type OwnerFormData = z.infer<typeof ownerSchema>
export type UnitFormData = z.infer<typeof unitSchema>
export type TenantFormData = z.infer<typeof tenantSchema>
export type LeaseFormData = z.infer<typeof leaseSchema>
export type OnboardingFormData = z.infer<typeof onboardingSchema>
export type PaymentUpdateFormData = z.infer<typeof paymentUpdateSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
