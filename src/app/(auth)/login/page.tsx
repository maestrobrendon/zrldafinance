
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
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Step = 'credentials' | 'password' | 'otp';
type LoginMethod = 'phone' | 'email'; 

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('credentials');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('phone');
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved.
          console.log("reCAPTCHA solved");
        }
      });
    }
  }, []);

  const handleNext = async () => {
    if (!identifier) {
      setError(`Please enter your ${loginMethod === 'phone' ? 'phone number' : 'email'}.`);
      return;
    }
    setError(null);
    setLoading(true);

    if (loginMethod === 'phone') {
      try {
        const appVerifier = window.recaptchaVerifier!;
        const formattedPhoneNumber = `+234${identifier.replace(/\D/g, '')}`;
        const result = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
        setConfirmationResult(result);
        setStep('otp');
      } catch (error: any) {
        console.error("OTP Send Error: ", error);
        setError("Failed to send OTP. Please check the number and try again.");
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
    } else {
      setStep('password');
      setLoading(false);
    }
  }

  const handleEmailLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, identifier, password);
      router.push("/dashboard");
    } catch (error: any) {
      setError(error.message);
      setStep('credentials'); // Go back to the first step on error
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = async () => {
    if (!confirmationResult) {
      setError("An error occurred. Please try again from the beginning.");
      setStep('credentials');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await confirmationResult.confirm(otp);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("OTP Verify Error: ", error);
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  
  const handleTabChange = (value: string) => {
    setLoginMethod(value as LoginMethod);
    setIdentifier("");
    setPassword("");
    setOtp("");
    setError(null);
    setStep('credentials');
  }

  const getActiveButton = () => {
    if (step === 'credentials') {
      return <Button className="w-full" onClick={handleNext} disabled={loading || !identifier}>Next</Button>;
    }
    if (step === 'password') {
      return <Button className="w-full" onClick={handleEmailLogin} disabled={loading || !password}>Log In</Button>;
    }
    if (step === 'otp') {
      return <Button className="w-full" onClick={handleOtpLogin} disabled={loading || otp.length < 6}>Verify & Log In</Button>;
    }
    return null;
  }
  
  const getCardDescription = () => {
    if (step === 'credentials') return "Enter your details to proceed.";
    if (step === 'password') return `Enter your password for ${identifier}`;
    if (step === 'otp') return `Enter the code sent to +234${identifier.replace(/\D/g, '')}`;
    return "";
  }

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Log In to Zrlda</CardTitle>
        <CardDescription>{getCardDescription()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-4 sm:px-6">
         <div id="recaptcha-container"></div>
        {error && (
            <Alert variant="destructive">
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {step === 'credentials' ? (
          <Tabs value={loginMethod} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="phone">Phone Number</TabsTrigger>
              <TabsTrigger value="email">Username</TabsTrigger>
            </TabsList>
            <TabsContent value="phone" className="mt-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="shrink-0">🇳🇬 +234</Button>
                    <Input id="phone" type="tel" placeholder="801 234 5678" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="email" className="mt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email / Username</Label>
                <Input id="email" type="email" placeholder="alex@example.com" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
              </div>
            </TabsContent>
          </Tabs>
        ) : step === 'password' ? (
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        ) : ( // step === 'otp'
           <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input id="otp" type="text" placeholder="Enter 6-digit code" required value={otp} onChange={(e) => setOtp(e.target.value)} />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4 px-4 sm:px-6">
        {getActiveButton()}
        <Button variant="link" size="sm" className="text-sm font-medium">Lost your phone? Lock your Account</Button>
        <div className="text-center text-sm">
          New to Zrlda?{" "}
          <Link href="/signup" className="font-semibold text-primary">
            Sign up
          </Link>
        </div>
      </CardFooter>
    </>
  );
}
