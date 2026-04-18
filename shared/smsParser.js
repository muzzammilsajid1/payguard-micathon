/**
 * Parse a raw SMS body and extract payment info if it matches
 * known Pakistani payment platforms (EasyPaisa, JazzCash, Raast).
 *
 * @param {string} body - Raw SMS text
 * @returns {object|null} { platform, amount, sender, timestamp } or null
 */
export function parseSMS(body) {
  if (!body || typeof body !== 'string') return null;

  const upper = body.toUpperCase();
  let platform = null;

  // ---- Detect platform ----
  if (upper.includes('EASYPAISA') || upper.includes('EASY PAISA')) {
    platform = 'EasyPaisa';
  } else if (upper.includes('JAZZCASH') || upper.includes('JAZZ CASH')) {
    platform = 'JazzCash';
  } else if (upper.includes('RAAST')) {
    platform = 'Raast';
  }

  if (!platform) return null;

  // ---- Extract amount ----
  // Common patterns:
  //   "Rs. 1,500.00"  "Rs 1500"  "PKR 2,000"  "Amount: Rs.500"  "received Rs1500"
  const amountMatch = body.match(
    /(?:Rs\.?\s*|PKR\s*|Amount[:\s]*Rs\.?\s*)([\d,]+(?:\.\d{1,2})?)/i
  );

  if (!amountMatch) return null;

  const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  if (isNaN(amount) || amount <= 0) return null;

  // ---- Extract sender (best effort) ----
  // Try patterns like "from 03001234567" or "from AHMED ALI"
  let sender = 'Unknown';
  const senderMatch = body.match(/from\s+([A-Za-z0-9\s]+?)(?:\s*\.|\s*$|\s+on\s|\s+via\s|\s+at\s)/i);
  if (senderMatch) {
    sender = senderMatch[1].trim();
  } else {
    // Try to find a phone number pattern
    const phoneMatch = body.match(/(03\d{9})/);
    if (phoneMatch) {
      sender = phoneMatch[1];
    }
  }

  return {
    platform,
    amount,
    sender,
    timestamp: new Date().toISOString(),
  };
}
