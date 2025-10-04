
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDocs, collection, query, where, Timestamp, writeBatch, updateDoc } from "firebase/firestore";
import { OtpLoginForm } from "@/components/auth/otp-login-form";
import { updateProfile } from "firebase/auth";


type Step = 'phone' | 'details';

async function generateUniqueZtag(name: string): Promise<string> {
    let ztag = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
    if (!ztag) {
        ztag = `user.${Math.random().toString(36).substring(2, 8)}`;
    }

    let isUnique = false;
    let attempts = 0;
    let finalZtag = ztag;

    while (!isUnique && attempts < 10) {
        const q = query(collection(db, "users"), where("ztag", "==", finalZtag));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            isUnique = true;
        } else {
            finalZtag = `${ztag}${Math.floor(Math.random() * 1000)}`;
            attempts++;
        }
    }

    if (!isUnique) {
        finalZtag = `user.${Date.now().toString().slice(-4)}`;
    }
    
    return finalZtag;
}

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('phone');
  
  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerificationSuccess = () => {
    setStep('details');
  };

  const handleSignup = async () => {
    if (!name || !email || !password) {
        setError("Please fill in all fields.");
        return;
    }
    const user = auth.currentUser;
    if (!user) {
        setError("Your phone verification session has expired. Please start over.");
        setStep('phone');
        return;
    }

    setLoading(true);
    setError(null);

    try {
        await updateProfile(user, { displayName: name });
        await updateDoc(doc(db, "users", user.uid), {
            email: email,
            // Note: We don't update the password here. Firebase Auth handles that separately.
        });


        const newPhotoURL = `https://picsum.photos/seed/${user.uid}/100/100`;
        const ztag = await generateUniqueZtag(name);
        const now = Timestamp.now();
        const batch = writeBatch(db);
        const userDocRef = doc(db, "users", user.uid);

        batch.set(userDocRef, {
            userId: user.uid,
            email: email,
            name: name,
            phone: user.phoneNumber,
            photoURL: newPhotoURL,
            ztag: ztag,
            balance: 50000,
            zcashBalance: 10000,
            kycStatus: 'pending',
            currency: 'NGN',
            createdAt: now,
            updatedAt: now,
        }, { merge: true });
        
        const walletsColRef = collection(userDocRef, 'wallets');
        const groceriesWalletRef = doc(walletsColRef);
        batch.set(groceriesWalletRef, {
            userId: user.uid, name: "Groceries", type: "budget", limit: 20000, balance: 5000, isLocked: true, createdAt: now
        });
        const rentWalletRef = doc(walletsColRef);
        batch.set(rentWalletRef, {
            userId: user.uid, name: "Rent", type: "goal", goalAmount: 200000, balance: 0, isLocked: true, createdAt: now
        });
        
        const txColRef = collection(userDocRef, 'transactions');
        const initialTxRef = doc(txColRef);
        batch.set(initialTxRef, {
            userId: user.uid, type: "income", amount: 50000, status: "completed", description: "Initial balance", timestamp: now, category: "Income"
        });

        await batch.commit();
        router.push("/dashboard");

    } catch (error: any) {
        console.error("Final Signup Error: ", error);
        setError('There was a problem setting up your account. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'phone':
        return (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Create an Account</CardTitle>
              <CardDescription>Enter your phone number to get started.</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <OtpLoginForm onSuccess={handleVerificationSuccess} />
            </CardContent>
          </>
        );
      case 'details':
        return (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Almost there!</CardTitle>
              <CardDescription>Complete your profile to finish setup.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6">
               {error && (
                  <Alert variant="destructive">
                      <AlertTitle>Signup Failed</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                  </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Alex Doe" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="alex@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 px-4 sm:px-6">
              <Button className="w-full" onClick={handleSignup} disabled={loading}>
                {loading ? <Icons.logo className="mr-2 h-4 w-4 animate-spin" /> : null}
                Finish Signup
              </Button>
            </CardFooter>
          </>
        );
    }
  };

  return (
    <>
      {renderStep()}
       <div className="text-center text-sm pb-6 px-4 sm:px-6">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary">
            Log in
          </Link>
      </div>
    </>
  );
}
