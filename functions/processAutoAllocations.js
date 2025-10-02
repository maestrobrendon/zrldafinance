// processAutoAllocations.js
/**
 * Handles auto-allocation from main wallet to user-defined wallets
 * Supports daily, weekly, monthly frequency
 */

import admin from "firebase-admin";

// Helper: get week number
Date.prototype.getWeekNumber = function () {
  const d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

export async function processAutoAllocations(userId, mainWalletId, db) {
  const mainWalletRef = db.collection("wallets").doc(mainWalletId);
  const mainWalletSnap = await mainWalletRef.get();

  if (!mainWalletSnap.exists) return;

  const allocationsSnapshot = await db.collection("auto_allocations")
    .where("userId", "==", userId)
    .where("active", "==", true)
    .get();

  const now = new Date();

  for (const allocDoc of allocationsSnapshot.docs) {
    const alloc = allocDoc.data();
    const last = new Date(alloc.lastExecuted || 0);

    let shouldExecute = false;

    switch (alloc.frequency) {
      case "daily":
        shouldExecute = now.toDateString() !== last.toDateString();
        break;
      case "weekly":
        shouldExecute = now.getWeekNumber() !== last.getWeekNumber();
        break;
      case "monthly":
        shouldExecute = now.getMonth() !== last.getMonth();
        break;
    }

    if (!shouldExecute) continue;

    // Calculate allocation amount
    let allocAmount = alloc.amount;
    if (alloc.type === "percentage") {
      allocAmount = (mainWalletSnap.data().balance * alloc.amount) / 100;
    }

    // Update target wallet
    const targetRef = db.collection("wallets").doc(alloc.targetWalletId);
    await targetRef.update({
      balance: admin.firestore.FieldValue.increment(allocAmount),
      last_updated: new Date().toISOString()
    });

    // Update lastExecuted timestamp
    await allocDoc.ref.update({ lastExecuted: now.toISOString() });
  }
}
