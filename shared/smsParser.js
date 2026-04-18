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
 * Platform detection is done via keyword presence checks
 * (no ^ / $ anchors) so the parser handles real-world SMS
 * bodies that include extra text such as timestamps,
 * transaction IDs, and balance information.
 *
 * Used by the owner Android app to decide whether an SMS
 * should trigger a Firestore write.
 * -------------------------------------------------------
 */

/**
 * Extracts a numeric amount from an SMS string.
 * Looks for the first occurrence of Rs., Rs, or PKR
 * followed by a number (with optional commas).
 *
 * @param {string} sms
 * @returns {number|null}
 */
function extractAmount(sms) {
  const amountRegex = /(?:rs\.?\s*|pkr\s*)([\d,]+)/i;
  const match = sms.match(amountRegex);
  if (!match) return null;
  return Number(match[1].replace(/,/g, ""));
}

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
  const smsLower = sms.toLowerCase();

  // --------------------------------------------------
  // EasyPaisa
  // Triggered when SMS contains "easypaisa" or starts with "EP:"
  //
  // Real example:
  //   "Dear Customer, Rs.1,500 has been credited to your Easypaisa Account
  //    03XX-XXXXXXX from 03XX-XXXXXXX on 18/04/2026 at 14:30. TxnID: EP123456789."
  // --------------------------------------------------
  if (smsLower.includes("easypaisa") || sms.startsWith("EP:")) {
    const amount = extractAmount(sms);
    if (amount === null) return null;

    // Extract sender: phone number appearing after "from"
    const senderRegex = /rs\.?\s*[\d,]+.*?from\s+([\d-]+)/i;
    const senderMatch = sms.match(senderRegex);
    const sender = senderMatch ? senderMatch[1].trim() : "Unknown";

    return {
      platform: "EasyPaisa",
      amount,
      sender,
      timestamp: new Date().toISOString(),
    };
  }

  // --------------------------------------------------
  // JazzCash
  // Triggered when SMS contains "jazzcash"
  //
  // Real example:
  //   "JazzCash: PKR 2,000 has been credited to your JazzCash Account from
  //    0321-XXXXXXX. Fee: Rs.0. Available Balance: Rs.4,500. TxnID: JC123456789."
  // --------------------------------------------------
  if (smsLower.includes("jazzcash")) {
    // Prefer PKR amount; fall back to any Rs. amount
    const pkrRegex = /pkr\s*([\d,]+)/i;
    const pkrMatch = sms.match(pkrRegex);
    const amount = pkrMatch
      ? Number(pkrMatch[1].replace(/,/g, ""))
      : extractAmount(sms);
    if (amount === null) return null;

    // Extract sender: phone number appearing after "from"
    const senderRegex = /from\s+([\d-]+)/i;
    const senderMatch = sms.match(senderRegex);
    const sender = senderMatch ? senderMatch[1].trim() : "Unknown";

    return {
      platform: "JazzCash",
      amount,
      sender,
      timestamp: new Date().toISOString(),
    };
  }

  // --------------------------------------------------
  // Raast
  // Triggered when SMS contains "raast"
  //
  // Real example:
  //   "Rs. 750 has been transferred to your account via Raast from HBL Bank.
  //    Your account balance is Rs. 3,250. Date: 18-Apr-2026."
  // --------------------------------------------------
  if (smsLower.includes("raast")) {
    const amount = extractAmount(sms);
    if (amount === null) return null;

    // Extract sender: everything after "from" up to a sentence boundary (. or end)
    const senderRegex = /raast\s+from\s+([^.]+)/i;
    const senderMatch = sms.match(senderRegex);
    const sender = senderMatch ? senderMatch[1].trim() : "Unknown";

    return {
      platform: "Raast",
      amount,
      sender,
      timestamp: new Date().toISOString(),
    };
  }

  // No platform matched — not a payment SMS
  return null;
}

export { parseSMS };