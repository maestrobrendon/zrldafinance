
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";
import { doc, setDoc, getDocs, collection, query, where, Timestamp, writeBatch } from "firebase/firestore";

type Step = 'phone' | 'otp' | 'details';

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

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('phone');
  
  // Form fields
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Firebase state
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'send-otp-button', {
            'size': 'invisible',
            'callback': (response: any) => {
                // reCAPTCHA solved.
                console.log("reCAPTCHA solved");
            }
        });
    }
  }

  const handleSendOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier!;
      const formattedPhoneNumber = `+234${phoneNumber.replace(/\D/g, '')}`;
      const result = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
      setConfirmationResult(result);
      setStep('otp');
    } catch (error: any) {
      console.error("OTP Send Error: ", error);
      setError("Failed to send OTP. Please check the number and try again. For testing, use numbers like 555-555-1234.");
      
      // Reset reCAPTCHA so user can try again
       if (window.recaptchaVerifier) {
            window.recaptchaVerifier.render().then(function(widgetId) {
                // @ts-ignore
                if (typeof grecaptcha !== 'undefined') {
                    grecaptcha.reset(widgetId);
                }
            });
        }

    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmationResult) {
      setError("An error occurred. Please try again.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await confirmationResult.confirm(otp);
      setStep('details');
    } catch (error: any) {
      console.error("OTP Verify Error: ", error);
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

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
        });
        
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
            <CardContent className="space-y-4 px-4 sm:px-6">
              {error && (
                <Alert variant="destructive">
                    <AlertTitle>Signup Failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="shrink-0">🇳🇬 +234</Button>
                    <Input id="phone" type="tel" placeholder="801 234 5678" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 px-4 sm:px-6">
              <Button id="send-otp-button" className="w-full" onClick={handleSendOtp} disabled={loading || !phoneNumber}>
                {loading ? <Icons.logo className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send OTP
              </Button>
            </CardFooter>
          </>
        );
      case 'otp':
        return (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Verify Your Number</CardTitle>
              <CardDescription>An OTP was sent to {`+234${phoneNumber.replace(/\D/g, '')}`}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6">
              {error && (
                  <Alert variant="destructive">
                      <AlertTitle>Verification Failed</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                  </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input id="otp" type="text" placeholder="Enter 6-digit code" required value={otp} onChange={(e) => setOtp(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 px-4 sm:px-6">
              <Button className="w-full" onClick={handleVerifyOtp} disabled={loading || otp.length < 6}>
                {loading ? <Icons.logo className="mr-2 h-4 w-4 animate-spin" /> : null}
                Verify
              </Button>
               <Button variant="link" size="sm" onClick={() => setStep('phone')}>Change Number</Button>
            </CardFooter>
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
