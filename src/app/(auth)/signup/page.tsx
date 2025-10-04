
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm, type FieldName } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { doc, setDoc, getDocs, collection, query, where, Timestamp, writeBatch } from "firebase/firestore";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { OtpLoginForm } from "@/components/auth/otp-login-form";
import { Checkbox } from "@/components/ui/checkbox";

type Step = 'name' | 'email' | 'username' | 'phone' | 'password' | 'ztag';

const signupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters.").regex(/^[a-zA-Z]+$/, "First name can only contain letters."),
  lastName: z.string().min(2, "Last name must be at least 2 characters.").regex(/^[a-zA-Z]+$/, "Last name can only contain letters."),
  email: z.string().email("Please enter a valid email address."),
  username: z.string().min(3, "Username must be 3-20 characters.").max(20, "Username must be 3-20 characters.").regex(/^[a-z0-9_]+$/, "Can only contain lowercase letters, numbers, and underscores."),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters.").regex(/\d/, "Password must contain at least one number."),
  confirmPassword: z.string(),
  ztag: z.string().min(3, "@Ztag must be 3-15 characters.").max(15, "@Ztag must be 3-15 characters.").regex(/^[a-z0-9]+$/, "Can only contain lowercase letters and numbers."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

async function checkUniqueness(field: 'username' | 'ztag', value: string): Promise<boolean> {
    if (!value) return false;
    const q = query(collection(db, "users"), where(field, "==", value.toLowerCase()));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
}

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('name');
  
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      phone: "",
      password: "",
      confirmPassword: "",
      ztag: "",
    },
  });

  const { trigger, formState: { errors, isValid } } = form;

  // UI state
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [skipPhone, setSkipPhone] = useState(false);

  useEffect(() => {
    if (step === 'ztag') {
      const { firstName, lastName } = form.getValues();
      if (firstName && !form.getValues('ztag')) {
          const baseZtag = `${firstName.toLowerCase().replace(/[^a-z0-9]/g, '')}${lastName.charAt(0).toLowerCase()}`;
          const suggested = `${baseZtag}${Math.floor(100 + Math.random() * 900)}`;
          form.setValue('ztag', suggested);
          trigger('ztag');
      }
    }
  }, [step, form, trigger]);
  
  useEffect(() => {
    const subscription = form.watch(async (value, { name }) => {
        if (name === 'username' || name === 'ztag') {
            setIsChecking(true);
            setIsAvailable(null);
            const fieldValue = value[name];
            if (fieldValue && !errors[name]) {
                const isUnique = await checkUniqueness(name, fieldValue);
                setIsAvailable(isUnique);
                if (!isUnique) {
                    form.setError(name, { type: "manual", message: `This ${name} is already taken.` });
                }
            } else {
                setIsAvailable(null);
            }
            setIsChecking(false);
        }
    });
    return () => subscription.unsubscribe();
  }, [form, errors]);


  const handleNextStep = async () => {
    setServerError(null);
    let fieldsToValidate: FieldName<SignupFormData>[] = [];
    let nextStep: Step | null = null;
    
    switch (step) {
      case 'name':
        fieldsToValidate = ['firstName', 'lastName'];
        nextStep = 'email';
        break;
      case 'email':
        fieldsToValidate = ['email'];
        nextStep = 'username';
        break;
      case 'username':
        fieldsToValidate = ['username'];
        nextStep = 'phone';
        break;
      case 'phone':
        // Skip validation, it's optional
        nextStep = 'password';
        break;
      case 'password':
        fieldsToValidate = ['password', 'confirmPassword'];
        nextStep = 'ztag';
        break;
    }
    
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid && nextStep) {
        setStep(nextStep);
    }
  };

  const handleVerificationSuccess = (phone: string) => {
    form.setValue('phone', phone);
    setStep('password');
  };

  const handleFinalSignup = async (data: SignupFormData) => {
    if (!isAvailable && step === 'ztag') {
        setServerError("The chosen @Ztag or username is not available.");
        return;
    }

    setLoading(true);
    setServerError(null);

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;

        await updateProfile(user, { 
            displayName: `${data.firstName} ${data.lastName}` 
        });

        const newPhotoURL = `https://picsum.photos/seed/${user.uid}/100/100`;
        const now = Timestamp.now();
        const batch = writeBatch(db);
        const userDocRef = doc(db, "users", user.uid);

        batch.set(userDocRef, {
            userId: user.uid,
            email: data.email,
            username: data.username,
            name: `${data.firstName} ${data.lastName}`,
            phone: data.phone || null,
            photoURL: newPhotoURL,
            ztag: data.ztag.toLowerCase(),
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
            setServerError("This email address is already registered. Please log in or use a different email.");
            setStep('email');
        } else {
            setServerError('There was a problem creating your account. Please try again.');
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
                <Input id="firstName" placeholder="Alex" {...form.register('firstName')} />
                 {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" {...form.register('lastName')} />
                {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleNextStep} disabled={!!errors.firstName || !!errors.lastName}>Next</Button>
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
                <Input id="email" type="email" placeholder="alex.doe@example.com" {...form.register('email')} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleNextStep} disabled={!!errors.email}>Next</Button>
            </CardFooter>
          </>
        );
        case 'username':
        return (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Create a username</CardTitle>
              <CardDescription>This will be your unique identifier on Zrlda.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="alexdoe" {...form.register('username')} />
                 {isChecking ? (
                    <p className="text-sm text-muted-foreground flex items-center pt-2"><Icons.logo className="mr-2 h-3 w-3 animate-spin"/> Checking...</p>
                 ) : errors.username ? (
                    <p className="text-sm text-destructive pt-2">{errors.username.message}</p>
                 ) : isAvailable === true ? (
                     <p className="text-sm text-green-500 pt-2">Username is available!</p>
                 ) : null}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleNextStep} disabled={!!errors.username || isChecking}>Next</Button>
            </CardFooter>
          </>
        );
      case 'phone':
        return (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Verify your Phone (Optional)</CardTitle>
              <CardDescription>This helps secure your account. You can also do this later.</CardDescription>
            </CardHeader>
            <CardContent>
               {showOtpForm ? (
                  <OtpLoginForm onSuccess={(phone) => handleVerificationSuccess(phone)} />
               ) : (
                 <div className="space-y-4">
                    <Button className="w-full" onClick={() => setShowOtpForm(true)}>Verify Phone Number</Button>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="skip-phone" checked={skipPhone} onCheckedChange={(checked) => setSkipPhone(checked as boolean)} />
                        <label
                            htmlFor="skip-phone"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                           Skip for now
                        </label>
                    </div>
                 </div>
               )}
            </CardContent>
             <CardFooter>
                {skipPhone && !showOtpForm && (
                    <Button className="w-full" onClick={handleNextStep}>Next</Button>
                )}
             </CardFooter>
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
                <Input id="password" type="password" {...form.register('password')} />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" {...form.register('confirmPassword')} />
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleNextStep} disabled={!!errors.password || !!errors.confirmPassword}>Next</Button>
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
                    <Input id="ztag" className="pl-6" {...form.register('ztag')} />
                </div>
                 {isChecking ? (
                    <p className="text-sm text-muted-foreground flex items-center pt-2"><Icons.logo className="mr-2 h-3 w-3 animate-spin"/> Checking availability...</p>
                 ) : errors.ztag ? (
                    <p className="text-sm text-destructive pt-2">{errors.ztag.message}</p>
                 ) : isAvailable === true ? (
                     <p className="text-sm text-green-500 pt-2">@{form.getValues('ztag')} is available!</p>
                 ) : null}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={form.handleSubmit(handleFinalSignup)} disabled={loading || isChecking || !!errors.ztag || !isAvailable}>
                {loading ? <Icons.logo className="mr-2 h-4 w-4 animate-spin" /> : null}
                Finish Signup
              </Button>
            </CardFooter>
          </>
        );
    }
  };
  
  const getPreviousStep = (): Step => {
      switch(step) {
          case 'email': return 'name';
          case 'username': return 'email';
          case 'phone': return 'username';
          case 'password': return 'phone';
          case 'ztag': return 'password';
          default: return 'name';
      }
  }

  return (
    <>
      {serverError && (
        <Alert variant="destructive" className="mx-6 mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}
      {renderStepContent()}
      <div className="text-center text-sm pb-6 px-4 sm:px-6">
        {step !== 'name' && 
            <Button variant="link" size="sm" onClick={() => setStep(getPreviousStep())}>
                Back
            </Button>
        }
        <p>Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary">
          Log in
        </Link>
        </p>
      </div>
    </>
  );
}
