/**
 * smsParser.test.js
 * -------------------------------------------------------
 * Unit tests for the PayGuard SMS parser.
 * Uses Node's built-in assert module — no external deps.
 * -------------------------------------------------------
 */

import assert from "node:assert";
import { parseSMS } from "./smsParser.js";

// ANSI color codes for terminal output
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`${GREEN}PASSED: ${name}${RESET}`);
    passed++;
  } catch (err) {
    console.log(`${RED}FAILED: ${name} - Expected: ${err.expected} Got: ${err.actual}${RESET}`);
    failed++;
  }
}

// -------------------------------------------------------
// EasyPaisa Tests
// -------------------------------------------------------

test("EasyPaisa — Rs.1,500 from 0312-1234567", () => {
  const result = parseSMS("EP: Rs.1,500 received from 0312-1234567 in your Mobile Account");
  assert.notStrictEqual(result, null);
  assert.strictEqual(result.platform, "EasyPaisa");
  assert.strictEqual(result.amount, 1500);
  assert.strictEqual(result.sender, "0312-1234567");
});

test("EasyPaisa — Rs.500 from 0333-9876543", () => {
  const result = parseSMS("EP: Rs.500 received from 0333-9876543 in your Mobile Account");
  assert.notStrictEqual(result, null);
  assert.strictEqual(result.platform, "EasyPaisa");
  assert.strictEqual(result.amount, 500);
  assert.strictEqual(result.sender, "0333-9876543");
});

// -------------------------------------------------------
// JazzCash Tests
// -------------------------------------------------------

test("JazzCash — PKR 2,000 from 0321-1111111", () => {
  const result = parseSMS("JazzCash: PKR 2,000 has been credited to your account from 0321-1111111");
  assert.notStrictEqual(result, null);
  assert.strictEqual(result.platform, "JazzCash");
  assert.strictEqual(result.amount, 2000);
  assert.strictEqual(result.sender, "0321-1111111");
});

// -------------------------------------------------------
// Raast Tests
// -------------------------------------------------------

test("Raast — Rs. 750 from HBL Bank", () => {
  const result = parseSMS("Rs. 750 has been transferred to your account via Raast from HBL Bank");
  assert.notStrictEqual(result, null);
  assert.strictEqual(result.platform, "Raast");
  assert.strictEqual(result.amount, 750);
  assert.strictEqual(result.sender, "HBL Bank");
});

// -------------------------------------------------------
// Null Cases — parser MUST return null for all of these
// -------------------------------------------------------

test("Null case — OTP message", () => {
  const result = parseSMS("Your OTP is 123456. Do not share with anyone.");
  assert.strictEqual(result, null);
});

test("Null case — bill reminder", () => {
  const result = parseSMS("Dear customer, your Zong bill of Rs.300 is due.");
  assert.strictEqual(result, null);
});

test("Null case — empty string", () => {
  const result = parseSMS("");
  assert.strictEqual(result, null);
});

// -------------------------------------------------------
// Summary
// -------------------------------------------------------

console.log("\n-----------------------------------");
console.log(`Total: ${passed + failed} | ${GREEN}Passed: ${passed}${RESET} | ${RED}Failed: ${failed}${RESET}`);
console.log("-----------------------------------");

// Run this file with: node smsParser.test.js
