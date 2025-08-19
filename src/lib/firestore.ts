import { db } from "./firebase";
import {
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  serverTimestamp,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
  writeBatch,
  runTransaction,
  onSnapshot,
  QuerySnapshot,
  DocumentData
} from "firebase/firestore";
import type {
  Owner,
  Unit,
  Tenant,
  Lease,
  Payment,
  Asset,
  CreateUnitForm,
  CreateTenantForm,
  CreateLeaseForm,
  CreatePaymentForm,
  UnitFilters,
  PaymentFilters
} from "../types";

// Collection references
export const ownersCol = () => collection(db, "owners");
export const unitsCol = () => collection(db, "units");
export const tenantsCol = () => collection(db, "tenants");
export const leasesCol = () => collection(db, "leases");
export const paymentsCol = () => collection(db, "payments");
export const assetsCol = () => collection(db, "assets");

// Owner operations
export async function upsertOwner(uid: string, email: string, name?: string): Promise<string> {
  const ref = doc(db, "owners", uid);
  await setDoc(ref, { 
    email, 
    name, 
    createdAt: serverTimestamp() 
  }, { merge: true });
  return ref.id;
}

export async function getOwner(uid: string): Promise<Owner | null> {
  const snap = await getDoc(doc(db, "owners", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } as Owner : null;
}

// Unit operations
export async function createUnit(data: CreateUnitForm): Promise<string> {
  return (await addDoc(unitsCol(), { 
    ...data, 
    createdAt: serverTimestamp() 
  })).id;
}

export async function getUnit(unitId: string): Promise<Unit | null> {
  const snap = await getDoc(doc(db, "units", unitId));
  return snap.exists() ? { id: snap.id, ...snap.data() } as Unit : null;
}

export async function getUnitsByOwner(ownerId: string): Promise<Unit[]> {
  const q = query(
    unitsCol(),
    where("ownerId", "==", ownerId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Unit);
}

export async function updateUnit(unitId: string, data: Partial<Unit>): Promise<void> {
  const ref = doc(db, "units", unitId);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteUnit(unitId: string): Promise<void> {
  await deleteDoc(doc(db, "units", unitId));
}

// Tenant operations
export async function createTenant(data: CreateTenantForm): Promise<string> {
  return (await addDoc(tenantsCol(), { 
    ...data, 
    createdAt: serverTimestamp() 
  })).id;
}

export async function getTenant(tenantId: string): Promise<Tenant | null> {
  const snap = await getDoc(doc(db, "tenants", tenantId));
  return snap.exists() ? { id: snap.id, ...snap.data() } as Tenant : null;
}

export async function getTenantsByOwner(ownerId: string): Promise<Tenant[]> {
  const q = query(
    tenantsCol(),
    where("ownerId", "==", ownerId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Tenant);
}

export async function updateTenant(tenantId: string, data: Partial<Tenant>): Promise<void> {
  const ref = doc(db, "tenants", tenantId);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteTenant(tenantId: string): Promise<void> {
  await deleteDoc(doc(db, "tenants", tenantId));
}

// Lease operations
export async function createLease(data: CreateLeaseForm): Promise<string> {
  return (await addDoc(leasesCol(), { 
    ...data, 
    createdAt: serverTimestamp() 
  })).id;
}

export async function getLease(leaseId: string): Promise<Lease | null> {
  const snap = await getDoc(doc(db, "leases", leaseId));
  return snap.exists() ? { id: snap.id, ...snap.data() } as Lease : null;
}

export async function getLeasesByUnit(unitId: string): Promise<Lease[]> {
  const q = query(
    leasesCol(),
    where("unitId", "==", unitId),
    orderBy("startDate", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Lease);
}

export async function getActiveLease(unitId: string): Promise<Lease | null> {
  const q = query(
    leasesCol(),
    where("unitId", "==", unitId),
    where("endDate", ">=", new Date().toISOString().split('T')[0]),
    limit(1)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.length > 0 
    ? { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Lease 
    : null;
}

export async function updateLease(leaseId: string, data: Partial<Lease>): Promise<void> {
  const ref = doc(db, "leases", leaseId);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function terminateLease(leaseId: string, endDate: string): Promise<void> {
  const ref = doc(db, "leases", leaseId);
  await updateDoc(ref, { 
    endDate, 
    status: "terminated",
    updatedAt: serverTimestamp() 
  });
}

// Payment operations
export async function createPayment(data: CreatePaymentForm): Promise<string> {
  return (await addDoc(paymentsCol(), { 
    ...data, 
    createdAt: serverTimestamp() 
  })).id;
}

export async function getPayment(paymentId: string): Promise<Payment | null> {
  const snap = await getDoc(doc(db, "payments", paymentId));
  return snap.exists() ? { id: snap.id, ...snap.data() } as Payment : null;
}

export async function getPaymentsByLease(leaseId: string): Promise<Payment[]> {
  const q = query(
    paymentsCol(),
    where("leaseId", "==", leaseId),
    orderBy("dueDate", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Payment);
}

export async function getPendingPayments(ownerId: string): Promise<Payment[]> {
  // Get all units for owner
  const units = await getUnitsByOwner(ownerId);
  const unitIds = units.map(u => u.id);
  
  // Get all leases for these units
  const allLeases: Lease[] = [];
  for (const unitId of unitIds) {
    const leases = await getLeasesByUnit(unitId);
    allLeases.push(...leases);
  }
  
  const leaseIds = allLeases.map(l => l.id);
  
  // Get pending payments
  const q = query(
    paymentsCol(),
    where("leaseId", "in", leaseIds),
    where("status", "in", ["pending", "late"]),
    orderBy("dueDate", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Payment);
}

export async function updatePaymentStatus(paymentId: string, status: Payment['status'], txRef?: string): Promise<void> {
  const ref = doc(db, "payments", paymentId);
  const updateData: any = { 
    status, 
    updatedAt: serverTimestamp() 
  };
  
  if (status === 'paid') {
    updateData.paidAt = serverTimestamp();
    if (txRef) updateData.txRef = txRef;
  }
  
  await updateDoc(ref, updateData);
}

// Asset operations
export async function createAsset(data: Omit<Asset, 'id'>): Promise<string> {
  return (await addDoc(assetsCol(), { 
    ...data, 
    createdAt: serverTimestamp() 
  })).id;
}

export async function getAssetsByUnit(unitId: string): Promise<Asset[]> {
  const q = query(
    assetsCol(),
    where("unitId", "==", unitId),
    orderBy("nextCertificationDate", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Asset);
}

export async function updateAsset(assetId: string, data: Partial<Asset>): Promise<void> {
  const ref = doc(db, "assets", assetId);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

// Batch operations
export async function createUnitWithAssets(
  unitData: CreateUnitForm, 
  assets: Omit<Asset, 'id' | 'unitId'>[]
): Promise<string> {
  const batch = writeBatch(db);
  
  // Create unit
  const unitRef = doc(unitsCol());
  batch.set(unitRef, { ...unitData, createdAt: serverTimestamp() });
  
  // Create assets
  assets.forEach(asset => {
    const assetRef = doc(assetsCol());
    batch.set(assetRef, { 
      ...asset, 
      unitId: unitRef.id, 
      createdAt: serverTimestamp() 
    });
  });
  
  await batch.commit();
  return unitRef.id;
}

// Real-time listeners
export function subscribeToUnit(unitId: string, callback: (unit: Unit | null) => void) {
  return onSnapshot(doc(db, "units", unitId), (doc) => {
    callback(doc.exists() ? { id: doc.id, ...doc.data() } as Unit : null);
  });
}

export function subscribeToPayments(leaseId: string, callback: (payments: Payment[]) => void) {
  const q = query(
    paymentsCol(),
    where("leaseId", "==", leaseId),
    orderBy("dueDate", "desc")
  );
  
  return onSnapshot(q, (snapshot) => {
    const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Payment);
    callback(payments);
  });
}
