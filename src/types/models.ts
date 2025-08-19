// web/src/types/models.ts
export type Owner = {
  id: string;
  email: string;
  name?: string;
  createdAt?: any; // Firestore Timestamp
};

export type Unit = {
  id: string;
  ownerId: string;
  address: string;
  city?: string;
  rooms?: number;
  m2?: number;
  rentAsk?: number;     // canone desiderato
  status?: "vacant" | "occupied";
  createdAt?: any;
};

export type Tenant = {
  id: string;
  ownerId: string;
  name: string;
  email: string;
  phone?: string;
  createdAt?: any;
};

export type Lease = {
  id: string;
  unitId: string;
  tenantId: string;
  startDate: string;    // ISO (YYYY-MM-DD)
  endDate?: string;
  rent: number;         // canone mensile
  dueDay: number;       // 1..28
  paymentMethod: "SEPA_MANDATE" | "MANUAL";
  mandateRef?: string;  // se SEPA
  tenantEmail?: string; // per reminder
  createdAt?: any;
};

export type Payment = {
  id: string;
  leaseId: string;
  amount: number;
  dueDate: string;      // ISO
  status: "pending" | "paid" | "late" | "failed";
  provider?: "MOCK" | "SEPA";
  txRef?: string;       // riferimento transazione
  createdAt?: any;
  paidAt?: any;
};

export type Asset = {
  id: string;
  unitId: string;
  type: "boiler" | "ac" | "extinguisher" | "other";
  nextCertificationDate?: string; // ISO
  providerPref?: string;
};
