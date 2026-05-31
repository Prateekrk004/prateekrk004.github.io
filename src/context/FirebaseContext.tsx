/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, onSnapshot, deleteDoc } from 'firebase/firestore';
import { auth, db, googleProvider, signInWithPopup, signOut, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, Order, SavedLocation, Reservation } from '../types';
import { INITIAL_USER_PROFILE, INITIAL_ORDERS, INITIAL_SAVED_LOCATIONS } from '../data';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  isSynced: boolean;
  profile: UserProfile;
  orders: Order[];
  locations: SavedLocation[];
  reservations: Reservation[];
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
  updateUserProfile: (newProfile: UserProfile) => Promise<void>;
  addSavedLocation: (loc: SavedLocation) => Promise<void>;
  removeSavedLocation: (id: string) => Promise<void>;
  addOrder: (order: Order) => Promise<void>;
  addReservation: (res: Reservation) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSynced, setIsSynced] = useState(false);

  // Fallback / Synced States
  const [profile, setProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [locations, setLocations] = useState<SavedLocation[]>(INITIAL_SAVED_LOCATIONS);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Sign in implementation
  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Authentication Error: ', err);
    }
  };

  // Log out implementation
  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error: ', err);
    }
  };

  // Profile update handler
  const updateUserProfile = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    if (user) {
      const userPath = `users/${user.uid}`;
      try {
        await setDoc(doc(db, 'users', user.uid), newProfile).catch(err => {
          handleFirestoreError(err, OperationType.UPDATE, userPath);
        });
      } catch (err) {
        console.error('Profile Firestore synchronization failed:', err);
      }
    }
  };

  // Saved Location handlers
  const addSavedLocation = async (loc: SavedLocation) => {
    setLocations((prev) => [...prev, loc]);
    if (user) {
      const locationPath = `users/${user.uid}/locations/${loc.id}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'locations', loc.id), loc).catch(err => {
          handleFirestoreError(err, OperationType.CREATE, locationPath);
        });
      } catch (err) {
        console.error('Location Firestore synchronization failed:', err);
      }
    }
  };

  const removeSavedLocation = async (id: string) => {
    setLocations((prev) => prev.filter((loc) => loc.id !== id));
    if (user) {
      const locationPath = `users/${user.uid}/locations/${id}`;
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'locations', id)).catch(err => {
          handleFirestoreError(err, OperationType.DELETE, locationPath);
        });
      } catch (err) {
        console.error('Location Firestore sync removal failed:', err);
      }
    }
  };

  // Order helper handlers
  const addOrder = async (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    if (user) {
      const orderPath = `users/${user.uid}/orders/${order.id}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'orders', order.id), order).catch(err => {
          handleFirestoreError(err, OperationType.CREATE, orderPath);
        });
      } catch (err) {
        console.error('Order Firestore synchronization failed:', err);
      }
    }
  };

  // Reservation helper handlers
  const addReservation = async (res: Reservation) => {
    setReservations((prev) => [res, ...prev]);
    if (user) {
      const resPath = `users/${user.uid}/reservations/${res.id}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'reservations', res.id), res).catch(err => {
          handleFirestoreError(err, OperationType.CREATE, resPath);
        });
      } catch (err) {
        console.error('Reservation Firestore synchronization failed:', err);
      }
    }
  };

  // Effect to manage Auth and Real-time Snapshot listeners
  useEffect(() => {
    let unsubscribeOrders: (() => void) | null = null;
    let unsubscribeLocations: (() => void) | null = null;
    let unsubscribeReservations: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        // Reset state back to local fallbacks
        setProfile(INITIAL_USER_PROFILE);
        setOrders(INITIAL_ORDERS);
        setLocations(INITIAL_SAVED_LOCATIONS);
        setReservations([]);
        setIsSynced(false);

        // Terminate any active listeners
        if (unsubscribeOrders) unsubscribeOrders();
        if (unsubscribeLocations) unsubscribeLocations();
        if (unsubscribeReservations) unsubscribeReservations();

        setLoading(false);
        return;
      }

      setLoading(true);
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocPath = `users/${currentUser.uid}`;

      try {
        let userDocSnap;
        try {
          userDocSnap = await getDoc(userDocRef);
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, userDocPath);
          return;
        }

        let currentProfile: UserProfile;

        if (!userDocSnap.exists()) {
          // Initialize user inside database
          currentProfile = {
            name: currentUser.displayName || INITIAL_USER_PROFILE.name,
            email: currentUser.email || INITIAL_USER_PROFILE.email,
            phone: currentUser.phoneNumber || INITIAL_USER_PROFILE.phone || '+1 (555) 019-8372',
            isBlackCard: true, // Gift Black Card status automatically to new signups
          };
          try {
            await setDoc(userDocRef, currentProfile);
          } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, userDocPath);
            return;
          }
        } else {
          currentProfile = userDocSnap.data() as UserProfile;
        }
        setProfile(currentProfile);

        // Bind Real-time subcollection listeners conforming to the specific error catching spec
        const ordersPath = `users/${currentUser.uid}/orders`;
        unsubscribeOrders = onSnapshot(collection(db, 'users', currentUser.uid, 'orders'), (snap) => {
          const list: Order[] = [];
          snap.forEach((docVal) => {
            list.push(docVal.data() as Order);
          });

          if (list.length === 0) {
            // Upload initial sample orders for seamless visual consistency
            INITIAL_ORDERS.forEach(async (o) => {
              await setDoc(doc(db, 'users', currentUser.uid, 'orders', o.id), o).catch(err => {
                handleFirestoreError(err, OperationType.CREATE, `users/${currentUser.uid}/orders/${o.id}`);
              });
            });
          } else {
            // Sort descending by id/date code
            setOrders(list.sort((a, b) => b.id.localeCompare(a.id)));
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, ordersPath);
        });

        const locationsPath = `users/${currentUser.uid}/locations`;
        unsubscribeLocations = onSnapshot(collection(db, 'users', currentUser.uid, 'locations'), (snap) => {
          const list: SavedLocation[] = [];
          snap.forEach((docVal) => {
            list.push(docVal.data() as SavedLocation);
          });

          if (list.length === 0) {
            // Upload initial coordinates for consistency
            INITIAL_SAVED_LOCATIONS.forEach(async (l) => {
              await setDoc(doc(db, 'users', currentUser.uid, 'locations', l.id), l).catch(err => {
                handleFirestoreError(err, OperationType.CREATE, `users/${currentUser.uid}/locations/${l.id}`);
              });
            });
          } else {
            setLocations(list);
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, locationsPath);
        });

        const reservationsPath = `users/${currentUser.uid}/reservations`;
        unsubscribeReservations = onSnapshot(collection(db, 'users', currentUser.uid, 'reservations'), (snap) => {
          const list: Reservation[] = [];
          snap.forEach((docVal) => {
            list.push(docVal.data() as Reservation);
          });
          setReservations(list);
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, reservationsPath);
        });

        setIsSynced(true);
      } catch (err) {
        console.error('Error establishing user snapshot sync maps:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeLocations) unsubscribeLocations();
      if (unsubscribeReservations) unsubscribeReservations();
    };
  }, []);

  return (
    <FirebaseContext.Provider
      value={{
        user,
        loading,
        isSynced,
        profile,
        orders,
        locations,
        reservations,
        signIn,
        logOut,
        updateUserProfile,
        addSavedLocation,
        removeSavedLocation,
        addOrder,
        addReservation,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be wrapped inside FirebaseProvider');
  }
  return context;
};
