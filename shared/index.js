/**
 * index.js
 * -------------------------------------------------------
 * Barrel file for the payguard-shared package.
 *
 * Re-exports everything from smsParser and firebaseHelpers
 * so consumers can import from a single entry point:
 *
 *   import { parseSMS, writePayment, ... } from "../shared/index.js";
 * -------------------------------------------------------
 */

export * from "./smsParser.js";
export * from "./firebaseHelpers.js";
