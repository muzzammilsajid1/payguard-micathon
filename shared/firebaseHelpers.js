import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';

/**
 * Initialize Firebase (only once) and return the Firestore DB instance.
 * @param {object} config - Firebase config object
 * @returns {object} Firestore database instance
 */
export function initFirebase(config) {
  if (getApps().length === 0) {
    initializeApp(config);
  }
  return getFirestore();
}

/**
 * Write (or overwrite) the shop configuration for a given owner.
 * Stored at: shops/{uid}
 *
 * @param {object} db       - Firestore instance
 * @param {string} uid      - Owner's Firebase Auth UID
 * @param {object} data     - { shopName: string, cashierCode: string }
 */
export async function writeShopConfig(db, uid, data) {
  const ref = doc(db, 'shops', uid);
  await setDoc(ref, {
    shopName: data.shopName,
    cashierCode: data.cashierCode,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

/**
 * Read the existing shop configuration for a given owner.
 * Returns null if no config exists yet.
 *
 * @param {object} db   - Firestore instance
 * @param {string} uid  - Owner's Firebase Auth UID
 * @returns {object|null}
 */
export async function getShopConfig(db, uid) {
  const ref = doc(db, 'shops', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

/**
 * Write a new payment document to Firestore.
 * Stored at: shops/{shopId}/payments/{auto-id}
 *
 * @param {object} db      - Firestore instance
 * @param {string} shopId  - Owner's UID (shop doc ID)
 * @param {object} payment - { platform, amount, sender, timestamp }
 */
export async function writePayment(db, shopId, payment) {
  const paymentsRef = collection(db, 'shops', shopId, 'payments');
  await addDoc(paymentsRef, {
    platform: payment.platform || 'Unknown',
    amount: payment.amount || 0,
    sender: payment.sender || 'Unknown',
    timestamp: payment.timestamp || new Date().toISOString(),
    createdAt: new Date().toISOString(),
  });
}

/**
 * Subscribe to real-time payment updates for a shop.
 * Calls `callback(payment)` every time a new payment document is added.
 * Returns an unsubscribe function.
 *
 * @param {object}   db       - Firestore instance
 * @param {string}   shopId   - Owner's UID (shop doc ID)
 * @param {Function} callback - Called with each payment object
 * @returns {Function} unsubscribe
 */
export function listenForPayments(db, shopId, callback) {
  const paymentsRef = collection(db, 'shops', shopId, 'payments');
  const q = query(paymentsRef, orderBy('createdAt', 'desc'));

  let initialLoad = true;

  const unsubscribe = onSnapshot(q, (snapshot) => {
    if (initialLoad) {
      // On first load, push all existing docs
      snapshot.docs.forEach((docSnap) => {
        callback(docSnap.data());
      });
      initialLoad = false;
    } else {
      // After that, only push newly added docs
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          callback(change.doc.data());
        }
      });
    }
  });

  return unsubscribe;
}
