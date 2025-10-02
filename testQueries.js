/**
 * testQueries.js
 * 
 * Script to run all possible Firestore queries for Zrlda Finance.
 * This helps Firebase generate required composite indexes automatically.
 * 
 * Usage:
 * 1. Place in project root
 * 2. `node testQueries.js`
 */

import admin from "firebase-admin";
import fs from "fs";
import path from "path";

// --- Firebase setup ---
const serviceAccountPath = path.resolve("./config/firebase-service-account.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ---- Test User & Wallet IDs ----
const TEST_USER_ID = "TEST_USER_ID";
const FROM_WALLET_ID = "FROM_WALLET_ID";
const TO_WALLET_ID = "TO_WALLET_ID";

async function runAllQueries() {
  try {

    console.log("=== 1️⃣ Fetch all wallets for user ===");
    await db.collection("wallets").where("userId", "==", TEST_USER_ID).get();

    console.log("=== 2️⃣ Fetch all open budget wallets ===");
    await db.collection("wallets")
      .where("userId", "==", TEST_USER_ID)
      .where("wallet_type", "==", "budget")
      .where("locked", "==", false)
      .get();

    console.log("=== 3️⃣ Fetch all open goal wallets ===");
    await db.collection("wallets")
      .where("userId", "==", TEST_USER_ID)
      .where("wallet_type", "==", "goal")
      .where("locked", "==", false)
      .get();

    console.log("=== 4️⃣ Wallet transfer query ===");
    // For composite index: balance comparison + locked
    await db.collection("wallets")
      .where("balance", ">", 0)
      .where("locked", "==", false)
      .get();

    console.log("=== 5️⃣ Fetch all transactions for a user ===");
    await db.collection("transactions")
      .where("account_number", "==", TEST_USER_ID)
      .orderBy("timestamp", "desc")
      .limit(50)
      .get();

    console.log("=== 6️⃣ Fetch transactions filtered by type ===");
    await db.collection("transactions")
      .where("account_number", "==", TEST_USER_ID)
      .where("transaction_type", "==", "wallet_inflow")
      .orderBy("timestamp", "desc")
      .get();

    console.log("=== 7️⃣ Fetch all auto allocations ===");
    await db.collection("auto_allocations")
      .where("userId", "==", TEST_USER_ID)
      .where("active", "==", true)
      .get();

    console.log("=== 8️⃣ Fetch all zcash wallets ===");
    await db.collection("zcash").get();

    console.log("=== 9️⃣ Fetch zcash balance for user ===");
    await db.collection("zcash")
      .where("userId", "==", TEST_USER_ID)
      .get();

    console.log("=== 🔄 Test combined queries for allocations ===");
    await db.collection("wallets")
      .where("userId", "==", TEST_USER_ID)
      .where("wallet_type", "in", ["budget", "goal"])
      .where("locked", "==", false)
      .orderBy("balance", "desc")
      .get();

    console.log("=== ✅ All queries executed ===");
    console.log("Check Firebase console for any index creation links.");

  } catch (err) {
    console.error("Query execution error:", err);
  }
}

// Run all queries
runAllQueries();
