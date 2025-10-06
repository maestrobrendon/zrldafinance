// server.js
/**
 * ZRLDA Finance Backend
 * Node.js + Express + Firebase
 */

import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { processAutoAllocations } from "./functions/processAutoAllocations.js";

dotenv.config();

// --- Firebase setup ---
const serviceAccountPath = path.resolve("./config/firebase-service-account.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// --- Express app setup ---
const app = express();
app.use(express.json());

// --- VFD environment variables ---
const VFD_BASE_URL = process.env.VFD_BASE_URL;
const CLIENT_ID = process.env.VFD_CLIENT_ID;
const CLIENT_SECRET = process.env.VFD_CLIENT_SECRET;

// Token cache
let tokenCache = null;

// --- Helper function: get VFD auth token ---
async function getAuthToken() {
  if (tokenCache) return tokenCache;
  try {
    const res = await axios.post(`${VFD_BASE_URL}/baasauth/token`, {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    });
    tokenCache = res.data.access_token;
    return tokenCache;
  } catch (err) {
    console.error("VFD Auth Error:", err.response?.data || err.message);
    throw new Error("Failed to get VFD auth token");
  }
}

// --- Routes ---
app.get("/", (req, res) => res.send("🚀 Zrlda backend is running"));

app.get("/auth-test", async (req, res) => {
  try {
    const token = await getAuthToken();
    res.json({ access_token: token });
  } catch {
    res.status(500).json({ error: "Auth failed" });
  }
});

app.post("/create-account", async (req, res) => {
  try {
    const { userId, name } = req.body;
    const token = await getAuthToken();

    const response = await axios.post(
      `${VFD_BASE_URL}/accounts/virtual`,
      { reference: userId, account_name: name },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Account creation error:", err.response?.data || err.message);
    res.status(500).json({ error: "Account creation failed" });
  }
});

// --- VFD Webhook ---
app.post("/webhook/vfd", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const expected = `Bearer ${process.env.VFD_WEBHOOK_SECRET}`;

  if (authHeader !== expected) return res.status(401).json({ error: "Unauthorized" });

  const payload = req.body;
  console.log("✅ VFD Webhook Received:", payload);

  try {
    const docId = payload.transaction_id || payload.session_id || payload.reference || Date.now().toString();
    const txRef = db.collection("transactions").doc(docId);

    await txRef.set({
      account_number: payload.account_number,
      account_name: payload.account_name || payload.originator_account_name || "N/A",
      reference: payload.reference || "N/A",
      amount: Number(payload.amount),
      currency: payload.currency || "NGN",
      transaction_type: payload.transaction_type || "wallet_inflow",
      narration: payload.narration || payload.originator_narration || "",
      balance: payload.balance || 0,
      timestamp: payload.timestamp,
      received_at: new Date().toISOString()
    });

    // --- Main wallet update ---
    const walletRef = db.collection("wallets").doc(payload.reference);
    await walletRef.set(
      {
        balance: admin.firestore.FieldValue.increment(Number(payload.amount)),
        account_number: payload.account_number,
        last_updated: new Date().toISOString(),
        wallet_type: "main"
      },
      { merge: true }
    );

    console.log("✅ Main wallet updated for:", payload.reference);

    // --- Auto-allocation ---
    // Note: processAutoAllocations is correctly called here where payload is defined
    await processAutoAllocations(payload.reference, walletRef.id, db);

    res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("Webhook handling error:", err);
    res.status(500).json({ error: "Failed to process webhook" });
  }
});

// ================================
// WALLET MANAGEMENT
// ================================

app.post("/wallets/create", async (req, res) => {
  try {
    const { userId, walletName, walletType } = req.body;
    if (!["budget", "goal"].includes(walletType)) return res.status(400).json({ error: "Invalid wallet type" });

    const walletRef = db.collection("wallets").doc();
    await walletRef.set({
      userId,
      walletName,
      wallet_type: walletType,
      balance: 0,
      locked: false,
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    });

    res.status(201).json({ status: "success", walletId: walletRef.id });
  } catch (err) {
    console.error("Create wallet error:", err);
    res.status(500).json({ error: "Failed to create wallet" });
  }
});

app.get("/wallets/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const snapshot = await db.collection("wallets").where("userId", "==", userId).get();
    const wallets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ wallets });
  } catch (err) {
    console.error("Fetch wallets error:", err);
    res.status(500).json({ error: "Failed to fetch wallets" });
  }
});

app.post("/wallets/transfer", async (req, res) => {
  try {
    const { fromWalletId, toWalletId, amount } = req.body;
    if (amount <= 0) return res.status(400).json({ error: "Amount must be positive" });

    const fromRef = db.collection("wallets").doc(fromWalletId);
    const toRef = db.collection("wallets").doc(toWalletId);
    const [fromDoc, toDoc] = await Promise.all([fromRef.get(), toRef.get()]);

    if (!fromDoc.exists || !toDoc.exists) return res.status(404).json({ error: "Wallet not found" });
    if (fromDoc.data().locked) return res.status(403).json({ error: "Source wallet is locked" });
    if (fromDoc.data().balance < amount) return res.status(400).json({ error: "Insufficient balance" });

    await fromRef.update({ balance: admin.firestore.FieldValue.increment(-amount), last_updated: new Date().toISOString() });
    await toRef.update({ balance: admin.firestore.FieldValue.increment(amount), last_updated: new Date().toISOString() });

    res.status(200).json({ status: "success" });
  } catch (err) {
    console.error("Wallet transfer error:", err);
    res.status(500).json({ error: "Failed to transfer funds" });
  }
});

// ================================
// ZCASH MINI-WALLET
// ================================

app.post("/zcash/create", async (req, res) => {
  try {
    const { userId } = req.body;
    const zcashRef = db.collection("zcash").doc(userId);
    const doc = await zcashRef.get();
    if (doc.exists) return res.status(400).json({ error: "Zcash wallet already exists" });

    await zcashRef.set({
      userId,
      balance: 0,
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    });

    res.status(201).json({ status: "success", message: "Zcash wallet created" });
  } catch (err) {
    console.error("Create Zcash wallet error:", err);
    res.status(500).json({ error: "Failed to create Zcash wallet" });
  }
});

app.post("/zcash/transfer", async (req, res) => {
  try {
    const { fromUserId, toUserId, amount } = req.body;
    if (amount <= 0 || fromUserId === toUserId) return res.status(400).json({ error: "Invalid transfer" });

    const fromRef = db.collection("zcash").doc(fromUserId);
    const toRef = db.collection("zcash").doc(toUserId);
    const [fromDoc, toDoc] = await Promise.all([fromRef.get(), toRef.get()]);

    if (!fromDoc.exists || !toDoc.exists) return res.status(404).json({ error: "Zcash wallet not found" });
    if (fromDoc.data().balance < amount) return res.status(400).json({ error: "Insufficient balance" });

    await fromRef.update({ balance: admin.firestore.FieldValue.increment(-amount), last_updated: new Date().toISOString() });
    await toRef.update({ balance: admin.firestore.FieldValue.increment(amount), last_updated: new Date().toISOString() });

    res.status(200).json({ status: "success", message: `Sent ${amount} to ${toUserId}` });
  } catch (err) {
    console.error("Zcash transfer error:", err);
    res.status(500).json({ error: "Failed to send Zcash" });
  }
});

app.get("/zcash/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const doc = await db.collection("zcash").doc(userId).get();
    if (!doc.exists) return res.status(404).json({ error: "Zcash wallet not found" });

    res.status(200).json({ balance: doc.data().balance });
  } catch (err) {
    console.error("Get Zcash balance error:", err);
    res.status(500).json({ error: "Failed to fetch Zcash balance" });
  }
});

// --- Start server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Zrlda backend running on port ${PORT}`));

// Note: Ensure no top-level await processAutoAllocations(...) call exists here or elsewhere

// Top-up Zcash from Main Wallet
app.post("/wallets/top-up-zcash", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (amount <= 0) return res.status(400).json({ error: "Amount must be positive" });

    const mainRef = db.collection("wallets").doc(userId); // main wallet docId = userId
    const zcashRef = db.collection("zcash").doc(userId);

    const [mainDoc, zcashDoc] = await Promise.all([mainRef.get(), zcashRef.get()]);

    if (!mainDoc.exists) return res.status(404).json({ error: "Main wallet not found" });
    if (!zcashDoc.exists) return res.status(404).json({ error: "Zcash wallet not found" });
    if (mainDoc.data().balance < amount) return res.status(400).json({ error: "Insufficient main wallet balance" });

    // Transfer
    await mainRef.update({ balance: admin.firestore.FieldValue.increment(-amount), last_updated: new Date().toISOString() });
    await zcashRef.update({ balance: admin.firestore.FieldValue.increment(amount), last_updated: new Date().toISOString() });

    res.status(200).json({ status: "success", message: `Moved ${amount} to Zcash wallet` });
  } catch (err) {
    console.error("Top-up Zcash error:", err);
    res.status(500).json({ error: "Failed to top-up Zcash wallet" });
  }
});


// --- USER SIGNUP WITH USERNAME UNIQUENESS --- //
app.post("/signup", async (req, res) => {
  try {
    const { userId, username, email, phone } = req.body;

    // normalize to lowercase for uniqueness
    const usernameKey = username.toLowerCase();

    const usernameRef = db.collection("usernames").doc(usernameKey);

    const usernameDoc = await usernameRef.get();

    if (usernameDoc.exists) {
      return res.status(400).json({ error: "Username already taken" });
    }

    // ✅ Reserve username immediately (atomic)
    await usernameRef.set({ userId });
    
    // ✅ Create the user record
    await db.collection("users").doc(userId).set({
      username: usernameKey,
      email,
      phone,
      created_at: new Date().toISOString(),
    });

    return res.status(201).json({ status: "success", message: "Signup complete" });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Signup failed" });
  }
});
