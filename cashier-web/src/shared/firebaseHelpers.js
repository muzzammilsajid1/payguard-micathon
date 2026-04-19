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

const firebaseConfig = {
  apiKey: "AIzaSyCAXQ3S8vG0SlxkCVSt8tr-pPP4G74JPDY",
  authDomain: "payguard-6b2e1.firebaseapp.com",
  projectId: "payguard-6b2e1",
  storageBucket: "payguard-6b2e1.firebasestorage.app",
  messagingSenderId: "515008564050",
  appId: "1:515008564050:web:ecb37ec41c3e804a5c088b",
};

const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

export function initFirebase() {
  return db;
}

export async function writePayment(shopId, paymentObj) {
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

export function listenForPayments(shopId, callback) {
  const paymentsRef = collection(db, "shops", shopId, "payments");
  const q = query(paymentsRef, orderBy("receivedAt", "desc"), limit(1));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const data = change.doc.data();
        callback({
          id: change.doc.id,
          amount: data.amount,
          sender: data.sender || "Unknown",
          platform: data.platform || "UPI",
          timestamp: data.receivedAt?.toDate?.() || new Date(),
          ...data,
        });
      }
    });
  });
  return unsubscribe;
}

export async function writeShopConfig(shopId, configObj) {
  try {
    const configRef = doc(db, "shops", shopId, "config", "main");
    await setDoc(configRef, configObj, { merge: true });
  } catch (error) {
    console.error("Error writing shop config:", error);
  }
}

export async function getShopConfig(shopId) {
  try {
    const configRef = doc(db, "shops", shopId, "config", "main");
    const snap = await getDoc(configRef);
    if (snap.exists()) return snap.data();
    return null;
  } catch (error) {
    console.error("Error getting shop config:", error);
    return null;
  }
}

export async function getShopByCode(cashierCode) {
  try {
    console.log("Looking for code:", cashierCode);
    const shopsSnapshot = await getDocs(collection(db, "shops"));
    console.log("Total shops found:", shopsSnapshot.docs.length);
    for (const shopDoc of shopsSnapshot.docs) {
      const configRef = doc(db, "shops", shopDoc.id, "config", "main");
      const configSnap = await getDoc(configRef);
      if (configSnap.exists()) {
        const data = configSnap.data();
        console.log("Shop data:", data);
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
