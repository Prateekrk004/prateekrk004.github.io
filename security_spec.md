# Security Specification: Luxe Meats Firebase Firestore

This document details the security model, invariants, "Dirty Dozen" threat payloads, and test structures to enforce strict attribute-based access control (ABAC).

## 1. Data Invariants

1. **Identity Isolation (Zero Leakage)**: A dining client can only read and write documents inside their own paths `/users/{userId}` and its subcollections. Blanket reads or cross-user writes are rejected.
2. **Privilege Integrity (Antispoofing)**: Users cannot set or elevate their own `isBlackCard` membership tier. This must remain immutable or require admin lookup validation.
3. **Identifier Safety**: All document and entity IDs must be validated string types (`isValidId()`), bounded in length, preventing Denial of Wallet resource injection.
4. **Subcollection Lock**: Orders, Saved Locations, and Reservations are subcollections strictly dependent on the parent `/users/{userId}` matches. If a user is not authenticated as `{userId}`, they fail instantly.

---

## 2. The "Dirty Dozen" Threat Payloads

Each payload below represents an attack vector designed to bypass security. Our rules must ensure all of these receive `PERMISSION_DENIED`.

### Vector A: Identity Spoofing & PII Harvesting
1. **The Profiler Probe (PII Leak)**: Authenticated user `hacker_123` attempts to `get` the profile of `victim_456` under `/users/victim_456`.
2. **The Order Hijack**: `hacker_123` attempts to `list` orders under `/users/victim_456/orders`.
3. **The Shadow Registration**: `hacker_123` attempts to write an order under `/users/victim_456/orders/order_xyz` with `total = 0`.

### Vector B: Self-Assigned Roles & Escalation
4. **The Membership Upgrader**: User `guest_789` attempts to `create` a profile with `isBlackCard: true`.
5. **The Mid-session Promotion**: User `guest_789` attempts to `update` their own profile to set `isBlackCard: true`.
6. **The Unverified Entry**: User whose auth token has `email_verified == false` attempts to write a reservation under their path.

### Vector C: Resource Poisoning & Value Injection
7. **The Infinite Coordinates Bomb**: An attacker attempts to register a location under `/users/{uid}/locations/large_payload` with a city name of size > 1MB.
8. **ID Injection Attack**: An attacker writes a reservation document where the document ID is `../../malicious_path` containing 500 junk symbols.
9. **The Zero-Total Invoice**: A client attempts to create an order under `/users/{uid}/orders/ord_1` with negative subtotal or an altered price list.

### Vector D: State & Immutability Corruption
10. **The Immortal Swap**: A user attempts to update their existing order, altering the immutable `id` or `date` field.
11. **Negative Seats Reservation**: A client attempts to book space with negative or non-numeric `partySize`.
12. **The Ghost Order Status**: A standard user attempts to manually sweep an order status field to "Delivered" without a delivery courier authority.

---

## 3. Test Schema (Conceptual Model)

```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';

// Verification test matrix
describe('Luxe Meats Security Rules', () => {
  it('cannot read another users profile', async () => {
    const db = getVictimDb();
    await assertFails(getDoc(doc(db, 'users/victim_456')));
  });

  it('cannot modify isBlackCard status', async () => {
    const db = getHackerDb();
    await assertFails(updateDoc(doc(db, 'users/hacker_123'), { isBlackCard: true }));
  });

  it('rejects unverified emails from writing reservations', async () => {
    const db = getUnverifiedDb();
    await assertFails(setDoc(doc(db, 'users/unverified_123/reservations/res_1'), { ...validRes }));
  });
});
```
