// If SMS background reading fails on demo day, use the manual button
// in ListeningDashboardScreen instead. The writePayment call is identical.

import SmsAndroid from 'react-native-get-sms-android';
import { PermissionsAndroid } from 'react-native';
import { parseSMS } from '../shared/smsParser';
import { writePayment } from '../shared/firebaseHelpers';

/**
 * Starts polling for incoming payment SMS every 5 seconds.
 * Parses each new SMS through the shared parser and pushes
 * recognized payments (EasyPaisa, JazzCash, Raast) to Firestore.
 *
 * @param {object} db   - Firestore database instance
 * @param {string} shopId - The shop/owner UID
 * @returns {{ stop: Function }} Call stop() to clear the polling interval
 */
export function startListening(db, shopId) {
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
          (fail) => {
            console.warn('[PayGuard] SMS read error:', fail);
          },
          (_count, smsList) => {
            try {
              const messages = JSON.parse(smsList);
              messages.forEach((sms) => {
                const body = sms.body || '';
                const result = parseSMS(body);
                if (result !== null) {
                  writePayment(db, shopId, result);
                }
              });
            } catch (parseErr) {
              console.warn('[PayGuard] SMS parse error:', parseErr);
            }
          },
        );
      }, 5000);
    } catch (err) {
      console.warn('[PayGuard] Permission request failed:', err);
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
