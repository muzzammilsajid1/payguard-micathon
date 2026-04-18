/**
 * smsParser.test.js
 * -------------------------------------------------------
 * Unit tests for the PayGuard SMS parser.
 * Uses Node's built-in assert module — no external deps.
 *
 * Tests cover BOTH:
 *   - Clean synthetic strings (original format)
 *   - Realistic full SMS bodies with timestamps, TxnIDs,
 *     balances, and extra surrounding text — proving the
 *     parser works on messages actually sent by the banks.
 * -------------------------------------------------------
 */

import assert from "node:assert";
import { parseSMS } from "./smsParser.js";

// ANSI color codes
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`${GREEN}PASSED: ${name}${RESET}`);
    passed++;
  } catch (err) {
    const expected = err.expected !== undefined ? err.expected : "see error";
    const actual = err.actual !== undefined ? err.actual : err.message;
    console.log(`${RED}FAILED: ${name}${RESET}`);
    console.log(`  Expected: ${expected}`);
    console.log(`  Got:      ${actual}`);
    failed++;
  }
}

function section(title) {
  console.log(`\n${CYAN}── ${title} ──${RESET}`);
}

// ═══════════════════════════════════════════════════════
// EASYPAISA TESTS
// ═══════════════════════════════════════════════════════

section("EasyPaisa — clean synthetic strings");

test("EP synthetic — Rs.1,500 from 0312-1234567", () => {
  const result = parseSMS("EP: Rs.1,500 received from 0312-1234567 in your Mobile Account");
  assert.notStrictEqual(result, null, "Expected a result, got null");
  assert.strictEqual(result.platform, "EasyPaisa");
  assert.strictEqual(result.amount, 1500);
  assert.strictEqual(result.sender, "0312-1234567");
});

test("EP synthetic — Rs.500 from 0333-9876543", () => {
  const result = parseSMS("EP: Rs.500 received from 0333-9876543 in your Mobile Account");
  assert.notStrictEqual(result, null, "Expected a result, got null");
  assert.strictEqual(result.platform, "EasyPaisa");
  assert.strictEqual(result.amount, 500);
  assert.strictEqual(result.sender, "0333-9876543");
});

section("EasyPaisa — realistic full SMS bodies");

test("EP realistic — credited with TxnID and timestamp", () => {
  const sms =
    "Dear Customer, Rs.1,500 has been credited to your Easypaisa Account " +
    "03XX-XXXXXXX from 0312-1234567 on 18/04/2026 at 14:30. TxnID: EP123456789.";
  const result = parseSMS(sms);
  assert.notStrictEqual(result, null, "Expected a result, got null");
  assert.strictEqual(result.platform, "EasyPaisa");
  assert.strictEqual(result.amount, 1500);
  assert.strictEqual(result.sender, "0312-1234567");
});

test("EP realistic — Rs.10,000 with balance info", () => {
  const sms =
    "EP: Rs.10,000 received from 0345-1112222 in your Easypaisa Account. " +
    "Available Balance: Rs.25,500. Date: 18-Apr-2026 11:05 AM.";
  const result = parseSMS(sms);
  assert.notStrictEqual(result, null, "Expected a result, got null");
  assert.strictEqual(result.platform, "EasyPaisa");
  assert.strictEqual(result.amount, 10000);
  assert.strictEqual(result.sender, "0345-1112222");
});

test("EP realistic — lowercase 'easypaisa' brand mention mid-sentence", () => {
  const sms =
    "Your easypaisa wallet has received Rs.750 from 0300-1234567. " +
    "Transaction ID: EP987654321. 18/04/2026 09:15.";
  const result = parseSMS(sms);
  assert.notStrictEqual(result, null, "Expected a result, got null");
  assert.strictEqual(result.platform, "EasyPaisa");
  assert.strictEqual(result.amount, 750);
  assert.strictEqual(result.sender, "0300-1234567");
});

// ═══════════════════════════════════════════════════════
// JAZZCASH TESTS
// ═══════════════════════════════════════════════════════

section("JazzCash — clean synthetic strings");

test("JC synthetic — PKR 2,000 from 0321-1111111", () => {
  const result = parseSMS("JazzCash: PKR 2,000 has been credited to your account from 0321-1111111");
  assert.notStrictEqual(result, null, "Expected a result, got null");
  assert.strictEqual(result.platform, "JazzCash");
  assert.strictEqual(result.amount, 2000);
  assert.strictEqual(result.sender, "0321-1111111");
});

section("JazzCash — realistic full SMS bodies");

test("JC realistic — JazzCash Account with fee and balance", () => {
  const sms =
    "JazzCash: PKR 2,000 has been credited to your JazzCash Account from " +
    "0321-9999999. Fee: Rs.0. Available Balance: Rs.4,500. TxnID: JC123456789.";
  const result = parseSMS(sms);
  assert.notStrictEqual(result, null, "Expected a result, got null");
  assert.strictEqual(result.platform, "JazzCash");
  assert.strictEqual(result.amount, 2000);
  assert.strictEqual(result.sender, "0321-9999999");
});

test("JC realistic — PKR 500 with date and time", () => {
  const sms =
    "JazzCash: PKR 500 has been credited to your JazzCash Account from " +
    "0300-9999999 on 18-Apr-2026 at 10:45 AM. Ref: JC000111222.";
  const result = parseSMS(sms);
  assert.notStrictEqual(result, null, "Expected a result, got null");
  assert.strictEqual(result.platform, "JazzCash");
  assert.strictEqual(result.amount, 500);
  assert.strictEqual(result.sender, "0300-9999999");
});

test("JC realistic — jazzcash lowercase mid-body", () => {
  const sms =
    "Your jazzcash wallet has received PKR 3,250 from 0311-5556677. " +
    "Available balance: Rs.7,000. TxnID: JC554433221.";
  const result = parseSMS(sms);
  assert.notStrictEqual(result, null, "Expected a result, got null");
  assert.strictEqual(result.platform, "JazzCash");
  assert.strictEqual(result.amount, 3250);
});

// ═══════════════════════════════════════════════════════
// RAAST TESTS
// ═══════════════════════════════════════════════════════

section("Raast — clean synthetic strings");

test("Raast synthetic — Rs. 750 from HBL Bank", () => {
  const result = parseSMS("Rs. 750 has been transferred to your account via Raast from HBL Bank");
  assert.notStrictEqual(result, null, "Expected a result, got null");
  assert.strictEqual(result.platform, "Raast");
  assert.strictEqual(result.amount, 750);
  assert.strictEqual(result.sender, "HBL Bank");
});

section("Raast — realistic full SMS bodies");

test("Raast realistic — Rs. 750 with balance info and date", () => {
  const sms =
    "Rs. 750 has been transferred to your account via Raast from HBL Bank. " +
    "Your account balance is Rs. 3,250. Date: 18-Apr-2026.";
  const result = parseSMS(sms);
  assert.notStrictEqual(result, null, "Expected a result, got null");
  assert.strictEqual(result.platform, "Raast");
  assert.strictEqual(result.amount, 750);
  assert.strictEqual(result.sender, "HBL Bank");
});

test("Raast realistic — Rs. 3,000 from MCB Bank with TxnID", () => {
  const sms =
    "Rs. 3,000 has been transferred to your account via Raast from MCB Bank. " +
    "TxnID: RST998877665. Balance: Rs.12,000. 18/04/2026 16:22.";
  const result = parseSMS(sms);
  assert.notStrictEqual(result, null, "Expected a result, got null");
  assert.strictEqual(result.platform, "Raast");
  assert.strictEqual(result.amount, 3000);
  assert.strictEqual(result.sender, "MCB Bank");
});

test("Raast realistic — uppercase RAAST in message", () => {
  const sms =
    "Dear User, Rs.5,000 received via RAAST from Meezan Bank. " +
    "Ref No: MBL202604180001. Your balance: Rs.18,500.";
  const result = parseSMS(sms);
  assert.notStrictEqual(result, null, "Expected a result, got null");
  assert.strictEqual(result.platform, "Raast");
  assert.strictEqual(result.amount, 5000);
});

// ═══════════════════════════════════════════════════════
// NULL CASES — parser MUST return null for all of these
// ═══════════════════════════════════════════════════════

section("Null cases — non-payment messages");

test("Null — OTP message", () => {
  assert.strictEqual(parseSMS("Your OTP is 123456. Do not share with anyone."), null);
});

test("Null — bill reminder", () => {
  assert.strictEqual(parseSMS("Dear customer, your Zong bill of Rs.300 is due."), null);
});

test("Null — empty string", () => {
  assert.strictEqual(parseSMS(""), null);
});

test("Null — promotional message", () => {
  assert.strictEqual(
    parseSMS("Get 50% off on your next recharge! Top up now and save big."),
    null
  );
});

test("Null — unrelated bank SMS without platform keyword", () => {
  assert.strictEqual(
    parseSMS("Your HBL account has been debited Rs.200 for ATM withdrawal."),
    null
  );
});

// ═══════════════════════════════════════════════════════
// RETURN SHAPE TESTS — verify timestamp is always present
// ═══════════════════════════════════════════════════════

section("Return shape — all required fields present");

test("Shape — timestamp is a valid ISO string", () => {
  const result = parseSMS("EP: Rs.100 received from 0300-0000000 in your Easypaisa Account");
  assert.notStrictEqual(result, null);
  assert.ok(typeof result.timestamp === "string", "timestamp should be a string");
  assert.ok(!isNaN(Date.parse(result.timestamp)), "timestamp should be a valid ISO date");
});

test("Shape — amount is a Number not a string", () => {
  const result = parseSMS("JazzCash: PKR 1,000 has been credited to your JazzCash Account from 0300-1111111");
  assert.notStrictEqual(result, null);
  assert.strictEqual(typeof result.amount, "number");
});

// ═══════════════════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════════════════

console.log("\n═══════════════════════════════════════");
console.log(
  `Total: ${passed + failed} | ${GREEN}Passed: ${passed}${RESET} | ${RED}Failed: ${failed}${RESET}`
);
console.log("═══════════════════════════════════════\n");

// Run this file with: node smsParser.test.js
