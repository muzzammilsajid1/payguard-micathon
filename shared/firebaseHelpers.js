import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";

/**
 * Initialize Firebase and return the Firestore db instance.
 * @param {Object} config - Firebase config object
 * @returns {Object} Firestore db instance
 */
export function initFirebase(config) {
  const app = initializeApp(config);
  const db = getFirestore(app);
  return db;
}

/**
 * Look up a shop by its 4-digit code.
 * @param {Object} db - Firestore db instance
 * @param {string} code - 4-digit shop code
 * @returns {Promise<string|null>} shopId (document ID) or null
 */
export async function getShopByCode(db, code) {
  const shopsRef = collection(db, "shops");
  const q = query(shopsRef, where("code", "==", code));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  // Return the first matching shop's document ID
  return snapshot.docs[0].id;
}

/**
 * Listen for new payments on a shop in real time.
 * Calls the callback with payment data when a new confirmed payment arrives.
 * @param {Object} db - Firestore db instance
 * @param {string} shopId - The shop document ID
 * @param {Function} callback - Called with payment data object
 * @returns {Function} unsubscribe function
 */
export function listenForPayments(db, shopId, callback) {
  const paymentsRef = collection(db, "shops", shopId, "payments");
  const q = query(paymentsRef, orderBy("timestamp", "desc"), limit(1));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const data = change.doc.data();
        callback({
          id: change.doc.id,
          amount: data.amount,
          sender: data.sender || "Unknown",
          platform: data.platform || "UPI",
          timestamp: data.timestamp?.toDate?.() || new Date(),
          ...data,
        });
      }
    });
  });

  return unsubscribe;
}
