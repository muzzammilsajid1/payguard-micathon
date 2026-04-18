// If SMS background reading fails on demo day, use the manual button
// in ListeningDashboardScreen instead. The writePayment call is identical.

import { Platform } from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// ---- Inlined from shared/smsParser ----
function parseSMS(sms) {
  if (!sms || typeof sms !== 'string' || sms.trim() === '') return null;
  const s = sms.trim();
  if (s.toLowerCase().includes('easypaisa') || s.startsWith('EP:')) {
    const match = s.match(/rs\.?\s*([\d,]+)/i);
    const sender = s.match(/from\s+([\d-]+)/i);
    if (match) return { platform: 'EasyPaisa', amount: Number(match[1].replace(/,/g, '')), sender: sender?.[1] || 'Unknown', timestamp: new Date().toISOString() };
  }
  if (s.toLowerCase().includes('jazzcash')) {
    const match = s.match(/(?:pkr|rs\.?)\s*([\d,]+)/i);
    const sender = s.match(/from\s+([\d-]+)/i);
    if (match) return { platform: 'JazzCash', amount: Number(match[1].replace(/,/g, '')), sender: sender?.[1] || 'Unknown', timestamp: new Date().toISOString() };
  }
  if (s.toLowerCase().includes('raast')) {
    const match = s.match(/rs\.?\s*([\d,]+)/i);
    const sender = s.match(/from\s+(.+?)(?:\.|$)/i);
    if (match) return { platform: 'Raast', amount: Number(match[1].replace(/,/g, '')), sender: sender?.[1] || 'Unknown', timestamp: new Date().toISOString() };
  }
  return null;
}

// ---- Inlined from shared/firebaseHelpers ----
async function writePayment(db, shopId, paymentObj) {
  const ref = collection(db, 'shops', shopId, 'payments');
  await addDoc(ref, { ...paymentObj, receivedAt: serverTimestamp() });
}

/**
 * Starts polling for incoming payment SMS every 5 seconds.
 * Parses each new SMS through the shared parser and pushes
 * recognized payments (EasyPaisa, JazzCash, Raast) to Firestore.
 *
 * No-ops silently on non-Android platforms (web bundler, iOS).
 *
 * @param {object} db   - Firestore database instance
 * @param {string} shopId - The shop/owner UID
 * @returns {{ stop: Function }} Call stop() to clear the polling interval
 */
export function startListening(db, shopId) {
  if (Platform.OS !== 'android') {
    console.log('[PayGuard] SMS listening only available on Android.');
    return { stop: () => {} };
  }

  const { default: SmsAndroid } = require('react-native-get-sms-android');
  const { PermissionsAndroid } = require('react-native');

  let intervalId = null;
  let lastCheckedTime = Date.now();

  // ---- Step 1: Request SMS permission ----
  const boot = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: 'SMS Permission',
          message: 'PayGuard needs access to your SMS to detect incoming payments.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        },
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.warn('[PayGuard] SMS permission denied — SMS listener inactive.');
        return;
      }

      // ---- Step 2: Set up polling loop ----
      intervalId = setInterval(() => {
        const now = Date.now();
        const filter = {
          box: 'inbox',
          minDate: lastCheckedTime,
          maxDate: now,
        };
        lastCheckedTime = now;

        SmsAndroid.list(
          JSON.stringify(filter),
          (fail) => console.warn('[PayGuard] SMS read error:', fail),
          (_count, smsList) => {
            try {
              const messages = JSON.parse(smsList);
              messages.forEach((sms) => {
                const result = parseSMS(sms.body || '');
                if (result !== null) {
                  writePayment(db, shopId, result);
                }
              });
            } catch (err) {
              console.warn('[PayGuard] Parse error:', err);
            }
          },
        );
      }, 5000);
    } catch (err) {
      console.warn('[PayGuard] Permission error:', err);
    }
  };

  boot();

  // ---- Step 3: Return a stop function ----
  return {
    stop: () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
  };
}
