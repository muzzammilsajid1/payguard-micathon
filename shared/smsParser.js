/**
 * smsParser.js
 * -------------------------------------------------------
 * PayGuard SMS Parser — the core detection engine.
 *
 * Parses raw incoming SMS messages and determines whether
 * they are real payment notifications from EasyPaisa,
 * JazzCash, or Raast. Returns a structured payment object
 * for valid payment SMS, or null for everything else
 * (OTPs, promos, bill reminders, junk, etc.).
 *
 * Used by the owner Android app to decide whether an SMS
 * should trigger a Firestore write.
 * -------------------------------------------------------
 */

/**
 * Parses a raw SMS string and extracts payment information.
 *
 * @param {string} rawSMS - The raw SMS message text.
 * @returns {{ platform: string, amount: number, sender: string, timestamp: string } | null}
 *   A payment object if the SMS is a valid payment notification, or null otherwise.
 */
function parseSMS(rawSMS) {
  // Guard: reject falsy / non-string / empty input immediately
  if (!rawSMS || typeof rawSMS !== "string" || rawSMS.trim() === "") {
    return null;
  }

  const sms = rawSMS.trim();

  // --------------------------------------------------
  // EasyPaisa
  // Example: "EP: Rs.1,500 received from 0312-1234567 in your Mobile Account"
  // --------------------------------------------------
  const easyPaisaRegex = /^EP:\s*Rs\.([\d,]+)\s+received\s+from\s+([\d-]+)\s+in\s+your\s+Mobile\s+Account$/i;
  const epMatch = sms.match(easyPaisaRegex);
  if (epMatch) {
    return {
      platform: "EasyPaisa",
      amount: Number(epMatch[1].replace(/,/g, "")),
      sender: epMatch[2].trim(),
      timestamp: new Date().toISOString(),
    };
  }

  // --------------------------------------------------
  // JazzCash
  // Example: "JazzCash: PKR 2,000 has been credited to your account from 0321-1111111"
  // --------------------------------------------------
  const jazzCashRegex = /^JazzCash:\s*PKR\s+([\d,]+)\s+has\s+been\s+credited\s+to\s+your\s+account\s+from\s+([\d-]+)$/i;
  const jcMatch = sms.match(jazzCashRegex);
  if (jcMatch) {
    return {
      platform: "JazzCash",
      amount: Number(jcMatch[1].replace(/,/g, "")),
      sender: jcMatch[2].trim(),
      timestamp: new Date().toISOString(),
    };
  }

  // --------------------------------------------------
  // Raast
  // Example: "Rs. 750 has been transferred to your account via Raast from HBL Bank"
  // --------------------------------------------------
  const raastRegex = /^Rs\.\s*([\d,]+)\s+has\s+been\s+transferred\s+to\s+your\s+account\s+via\s+Raast\s+from\s+(.+)$/i;
  const raastMatch = sms.match(raastRegex);
  if (raastMatch) {
    return {
      platform: "Raast",
      amount: Number(raastMatch[1].replace(/,/g, "")),
      sender: raastMatch[2].trim(),
      timestamp: new Date().toISOString(),
    };
  }

  // No pattern matched — not a payment SMS
  return null;
}

export { parseSMS };