
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
import { doc, setDoc, getDocs, collection, query, where, Timestamp, updateProfile, writeBatch } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { OtpLoginForm } from "@/components/auth/otp-login-form";

type Step = 'name' | 'email' | 'phone' | 'password' | 'ztag';

async function checkZtagUniqueness(ztag: string): Promise<boolean> {
    if (!ztag) return false;
    const q = query(collection(db, "users"), where("ztag", "==", ztag.toLowerCase()));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
}

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('name');
  
  // Form data state
  const [formData, setFormData] = useState({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      ztag: "",
  });

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isZtagChecking, setIsZtagChecking] = useState(false);
  const [isZtagAvailable, setIsZtagAvailable] = useState<boolean | null>(null);
  const [ztagSuggestion, setZtagSuggestion] = useState("");

  useEffect(() => {
    if (step === 'ztag' && formData.firstName && !ztagSuggestion) {
        const baseZtag = `${formData.firstName.toLowerCase().replace(/[^a-z0-9]/g, '')}${formData.lastName.charAt(0).toLowerCase()}`;
        const suggested = `${baseZtag}${Math.floor(100 + Math.random() * 900)}`;
        setZtagSuggestion(suggested);
        setFormData(prev => ({ ...prev, ztag: suggested }));
        checkZtagUniqueness(suggested).then(setIsZtagAvailable);
    }
  }, [step, formData.firstName, formData.lastName, ztagSuggestion]);

  const handleZtagChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZtag = e.target.value;
    setFormData(prev => ({ ...prev, ztag: newZtag }));
    if (newZtag) {
      setIsZtagChecking(true);
      const isUnique = await checkZtagUniqueness(newZtag);
      setIsZtagAvailable(isUnique);
      setIsZtagChecking(false);
    } else {
      setIsZtagAvailable(null);
    }
  };

  const handleNextStep = () => {
    setError(null);
    switch (step) {
      case 'name':
        if (!formData.firstName || !formData.lastName) {
          setError("Please enter your first and last name.");
          return;
        }
        setStep('email');
        break;
      case 'email':
        if (!formData.email.includes('@')) {
          setError("Please enter a valid email address.");
          return;
        }
        setStep('phone');
        break;
      case 'phone':
        // This case is handled by the OtpLoginForm's onSuccess
        break;
      case 'password':
        if (formData.password.length < 6) {
          setError("Password must be at least 6 characters long.");
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match.");
          return;
        }
        setStep('ztag');
        break;
    }
  };

  const handleVerificationSuccess = (phone: string) => {
    setFormData(prev => ({ ...prev, phone }));
    setStep('password');
  };

  const handleFinalSignup = async () => {
    if (!isZtagAvailable) {
        setError("The chosen Z-tag is not available. Please pick another one.");
        return;
    }

    setLoading(true);
    setError(null);

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        await updateProfile(user, { 
            displayName: `${formData.firstName} ${formData.lastName}` 
        });

        const newPhotoURL = `https://picsum.photos/seed/${user.uid}/100/100`;
        const now = Timestamp.now();
        const batch = writeBatch(db);
        const userDocRef = doc(db, "users", user.uid);

        batch.set(userDocRef, {
            userId: user.uid,
            email: formData.email,
            name: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phone,
            photoURL: newPhotoURL,
            ztag: formData.ztag.toLowerCase(),
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
        if (error.code === 'auth/email-already-in-use') {
            setError("This email address is already registered. Please log in or use a different email.");
        } else {
            setError('There was a problem creating your account. Please try again.');
        }
    } finally {
        setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'name':
        return (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Create an Account</CardTitle>
              <CardDescription>Let's start with your name.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="Alex" required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleNextStep}>Next</Button>
            </CardFooter>
          </>
        );
      case 'email':
        return (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">What's your email?</CardTitle>
              <CardDescription>We'll use this to help you recover your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="alex.doe@example.com" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleNextStep}>Next</Button>
            </CardFooter>
          </>
        );
      case 'phone':
        return (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Verify your Phone</CardTitle>
              <CardDescription>We'll send you a one-time password (OTP).</CardDescription>
            </CardHeader>
            <CardContent>
              <OtpLoginForm onSuccess={(phone) => handleVerificationSuccess(phone)} />
            </CardContent>
          </>
        );
      case 'password':
        return (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Create a Password</CardTitle>
              <CardDescription>Make sure it's secure and memorable.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" required value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleNextStep}>Next</Button>
            </CardFooter>
          </>
        );
      case 'ztag':
        return (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Choose your @Ztag</CardTitle>
              <CardDescription>This is your unique username for sending and receiving ZCash.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="ztag">Your @Ztag</Label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                    <Input id="ztag" placeholder={ztagSuggestion} className="pl-6" required value={formData.ztag} onChange={handleZtagChange} />
                </div>
                 {isZtagChecking ? (
                    <p className="text-sm text-muted-foreground flex items-center pt-2"><Icons.logo className="mr-2 h-3 w-3 animate-spin"/> Checking availability...</p>
                 ) : isZtagAvailable === true ? (
                    <p className="text-sm text-green-500 pt-2">@{formData.ztag} is available!</p>
                 ) : isZtagAvailable === false ? (
                    <p className="text-sm text-destructive pt-2">@{formData.ztag} is already taken.</p>
                 ) : null}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleFinalSignup} disabled={loading || !isZtagAvailable}>
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
      {error && (
        <Alert variant="destructive" className="mx-6 mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {renderStepContent()}
      <div className="text-center text-sm pb-6 px-4 sm:px-6">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary">
          Log in
        </Link>
      </div>
    </>
  );
}
