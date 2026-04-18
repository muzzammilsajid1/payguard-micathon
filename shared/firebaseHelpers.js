/**
 * firebaseHelpers.js
 * -------------------------------------------------------
 * PayGuard Firebase Firestore Utilities
 *
 * Contains all Firestore read/write logic shared between
 * the owner Android app and the cashier web app. This
 * keeps every Firebase interaction in one central place.
 *
 * Functions:
 *   initFirebase(config)          — Initialize Firebase app + Firestore
 *   writePayment(db, shopId, obj) — Write a detected payment to Firestore
 *   listenForPayments(db, shopId, cb) — Real-time listener for new payments
 *   writeShopConfig(db, shopId, cfg)  — Write/merge shop configuration
 *   getShopConfig(db, shopId)         — Read shop configuration
 *   getShopByCode(db, cashierCode)    — Find a shop by its cashier code
 * -------------------------------------------------------
 */

import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  serverTimestamp,
  setDoc,
  getDoc,
  doc,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
} from "firebase/firestore";

// -------------------------------------------------------
// 1. initFirebase — one-time Firebase + Firestore init
// -------------------------------------------------------

/**
 * Initializes the Firebase app and returns a Firestore
 * database instance. Guards against double-initialization.
 *
 * @param {object} config - Firebase project configuration object.
 * @returns {import("firebase/firestore").Firestore} The Firestore db instance.
 */
export function initFirebase(config) {
  let app;

  // If an app is already initialized, reuse it
  if (getApps().length > 0) {
    app = getApps()[0];
  } else {
    app = initializeApp(config);
  }

  const db = getFirestore(app);
  return db;
}

// -------------------------------------------------------
// 2. writePayment — store a detected payment in Firestore
// -------------------------------------------------------

/**
 * Writes a new payment document to shops/{shopId}/payments.
 * Automatically adds a server-side receivedAt timestamp.
 *
 * @param {import("firebase/firestore").Firestore} db
 * @param {string} shopId
 * @param {object} paymentObj - The parsed payment data from smsParser.
 * @returns {Promise<string|undefined>} The new document ID, or undefined on error.
 */
export async function writePayment(db, shopId, paymentObj) {
  try {
    const paymentsRef = collection(db, "shops", shopId, "payments");
    const docRef = await addDoc(paymentsRef, {
      ...paymentObj,
      receivedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error writing payment:", error);
  }
}

// -------------------------------------------------------
// 3. listenForPayments — real-time listener for cashier UI
// -------------------------------------------------------

/**
 * Sets up a real-time Firestore listener on the payments
 * subcollection. Ordered by receivedAt descending, limited
 * to the single most recent document. Calls `callback` with
 * the payment data every time a new payment arrives.
 *
 * @param {import("firebase/firestore").Firestore} db
 * @param {string} shopId
 * @param {(paymentData: object) => void} callback
 * @returns {() => void} An unsubscribe function to tear down the listener.
 */
export function listenForPayments(db, shopId, callback) {
  const paymentsRef = collection(db, "shops", shopId, "payments");
  const q = query(paymentsRef, orderBy("receivedAt", "desc"), limit(1));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        callback(change.doc.data());
      }
    });
  });

  return unsubscribe;
}

// -------------------------------------------------------
// 4. writeShopConfig — create or update shop configuration
// -------------------------------------------------------

/**
 * Writes shop configuration to shops/{shopId}/config.
 * Uses setDoc with merge so existing fields are preserved.
 *
 * @param {import("firebase/firestore").Firestore} db
 * @param {string} shopId
 * @param {{ shopName: string, cashierCode: string }} configObj
 * @returns {Promise<void>}
 */
export async function writeShopConfig(db, shopId, configObj) {
  try {
    const configRef = doc(db, "shops", shopId, "config", "main");
    await setDoc(configRef, configObj, { merge: true });
  } catch (error) {
    console.error("Error writing shop config:", error);
  }
}

// -------------------------------------------------------
// 5. getShopConfig — read shop configuration
// -------------------------------------------------------

/**
 * Reads the shop configuration document.
 *
 * @param {import("firebase/firestore").Firestore} db
 * @param {string} shopId
 * @returns {Promise<object|null>} The config data or null if not found.
 */
export async function getShopConfig(db, shopId) {
  try {
    const configRef = doc(db, "shops", shopId, "config", "main");
    const snap = await getDoc(configRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting shop config:", error);
    return null;
  }
}

// -------------------------------------------------------
// 6. getShopByCode — look up a shop by its cashier code
// -------------------------------------------------------

/**
 * Iterates over every shop document and checks its config
 * subcollection for a matching cashierCode. Returns the
 * first matching shopId, or null if none match.
 *
 * @param {import("firebase/firestore").Firestore} db
 * @param {string} cashierCode
 * @returns {Promise<string|null>} The matching shopId or null.
 */
export async function getShopByCode(db, cashierCode) {
  try {
    const shopsSnapshot = await getDocs(collection(db, "shops"));

    for (const shopDoc of shopsSnapshot.docs) {
      const configRef = doc(db, "shops", shopDoc.id, "config", "main");
      const configSnap = await getDoc(configRef);

      if (configSnap.exists()) {
        const data = configSnap.data();
        if (data.cashierCode === cashierCode) {
          return shopDoc.id;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Error getting shop by code:", error);
    return null;
  }
}