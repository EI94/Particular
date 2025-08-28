import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Unit, Lease, Payment, Tenant } from "../types";

// Utility per combinare classi CSS con Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formattazione valuta
export function formatCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency,
  }).format(amount);
}

// Formattazione date
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("it-IT", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  }).format(dateObj);
}

// Formattazione date brevi
export function formatShortDate(date: string | Date): string {
  return formatDate(date, {
    month: "short",
    day: "numeric",
  });
}

// Calcolo giorni rimanenti
export function getDaysRemaining(date: string | Date): number {
  const targetDate = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Calcolo prossima data di scadenza
export function getNextDueDate(leaseStartDate: string, dueDay: number): string {
  const startDate = new Date(leaseStartDate);
  const currentDate = new Date();
  
  // Trova la prossima data di scadenza
  let nextDueDate = new Date(startDate);
  nextDueDate.setDate(dueDay);
  
  // Se la data è già passata, vai al mese successivo
  while (nextDueDate <= currentDate) {
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);
  }
  
  return nextDueDate.toISOString().split('T')[0];
}

// Generazione ID univoci
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Validazione email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validazione telefono italiano
export function isValidItalianPhone(phone: string): boolean {
  const phoneRegex = /^(\+39|0039)?[ ]?[0-9]{3}[ ]?[0-9]{3}[ ]?[0-9]{4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

// Calcolo area totale
export function calculateTotalArea(units: Array<{ m2?: number }>): number {
  return units.reduce((total, unit) => total + (unit.m2 || 0), 0);
}

// Calcolo reddito totale
export function calculateTotalRent(leases: Array<{ rent: number }>): number {
  return leases.reduce((total, lease) => total + lease.rent, 0);
}

// Calcolo occupazione
export function calculateOccupancyRate(units: Array<{ status?: string }>): number {
  const total = units.length;
  const occupied = units.filter(unit => unit.status === "occupied").length;
  return total > 0 ? (occupied / total) * 100 : 0;
}

// Filtro unità per criteri
export function filterUnits(
  units: Array<Unit>,
  filters: {
    status?: string;
    city?: string;
    minRooms?: number;
    maxRooms?: number;
    minM2?: number;
    maxM2?: number;
    minRent?: number;
    maxRent?: number;
  }
): Unit[] {
  return units.filter(unit => {
    if (filters.status && unit.status !== filters.status) return false;
    if (filters.city && unit.city !== filters.city) return false;
    if (filters.minRooms && (unit.rooms || 0) < filters.minRooms) return false;
    if (filters.maxRooms && (unit.rooms || 0) > filters.maxRooms) return false;
    if (filters.minM2 && (unit.m2 || 0) < filters.minM2) return false;
    if (filters.maxM2 && (unit.m2 || 0) > filters.maxM2) return false;
    if (filters.minRent && (unit.rentAsk || 0) < filters.minRent) return false;
    if (filters.maxRent && (unit.rentAsk || 0) > filters.maxRent) return false;
    return true;
  });
}

// Ordinamento unità
export function sortUnits(
  units: Unit[],
  sortBy: keyof Unit = "createdAt",
  sortOrder: "asc" | "desc" = "desc"
): Unit[] {
  return [...units].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    
    if (aVal === undefined && bVal === undefined) return 0;
    if (aVal === undefined) return 1;
    if (bVal === undefined) return -1;
    
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortOrder === "asc" 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    }
    
    return 0;
  });
}

// Calcolo statistiche dashboard
export function calculateDashboardStats(
  units: Unit[],
  leases: Lease[],
  payments: Payment[],
  tenants: Tenant[]
): {
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  totalRent: number;
  pendingPayments: number;
  overduePayments: number;
  totalTenants: number;
  activeLeases: number;
} {
  const totalUnits = units.length;
  const occupiedUnits = units.filter(u => u.status === "occupied").length;
  const vacantUnits = units.filter(u => u.status === "vacant").length;
  
  const activeLeases = leases.filter(l => !l.endDate || new Date(l.endDate) > new Date()).length;
  const totalRent = leases.reduce((sum, l) => sum + l.rent, 0);
  
  const pendingPayments = payments.filter(p => p.status === "pending").length;
  const overduePayments = payments.filter(p => 
    p.status === "pending" && new Date(p.dueDate) < new Date()
  ).length;
  
  const totalTenants = tenants.length;
  
  return {
    totalUnits,
    occupiedUnits,
    vacantUnits,
    totalRent,
    pendingPayments,
    overduePayments,
    totalTenants,
    activeLeases,
  };
}

// Conversione Firestore timestamp
export function fromFirestoreTimestamp(timestamp: any): Date | null {
  if (!timestamp) return null;
  if (timestamp.toDate) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  return new Date(timestamp);
}

// Conversione a Firestore timestamp
export function toFirestoreTimestamp(date: Date | string): any {
  if (typeof date === "string") return new Date(date);
  return date;
}

// Costante per il fuso orario italiano
const TZ = "Europe/Rome";

// Genera la data odierna in formato ISO YYYY-MM-DD per l'Italia
export function isoToday(tz = TZ) {
  const d = new Date();
  // normalizza a YYYY-MM-DD locale Italia
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Calcola la data di scadenza (YYYY-MM-DD) del mese corrente per un dato dueDay (1..28)
export function dueDateForCurrentMonth(dueDay: number) {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(Math.min(Math.max(dueDay, 1), 28)).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Calcolo ROI mensile convertito in annuale (grezzo, MVP)
export function monthlyToAnnualROI(monthlyNet: number, propertyValue: number) {
  if (!propertyValue || propertyValue <= 0) return 0;
  return (monthlyNet * 12 * 100) / propertyValue;
}
