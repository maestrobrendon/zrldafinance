
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
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Step = 'credentials' | 'password';
type LoginMethod = 'phone' | 'email'; // Using email for username functionality

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('credentials');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('phone');
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (!identifier) {
      setError(`Please enter your ${loginMethod === 'phone' ? 'phone number' : 'email'}.`);
      return;
    }
    setError(null);
    setStep('password');
  }

  const handleLogin = async () => {
    if (loginMethod === 'phone') {
        setError("Phone number login is not implemented in this prototype. Please use email/password.");
        return;
    }

    setLoading(true);
    setError(null);
    try {
      // For this prototype, 'username' is treated as email
      await signInWithEmailAndPassword(auth, identifier, password);
      router.push("/dashboard");
    } catch (error: any) {
      setError(error.message);
      setStep('credentials'); // Go back to the first step on error
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (value: string) => {
    setLoginMethod(value as LoginMethod);
    setIdentifier("");
    setError(null);
  }

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Log In to Zrlda</CardTitle>
        {step === 'credentials' && <CardDescription>Enter your details to proceed.</CardDescription>}
        {step === 'password' && <CardDescription>Enter your password for {identifier}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4 px-4 sm:px-6">
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
        ) : (
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4 px-4 sm:px-6">
        {step === 'credentials' ? (
            <Button className="w-full" onClick={handleNext} disabled={loading}>
              Next
            </Button>
        ) : (
            <Button className="w-full" onClick={handleLogin} disabled={loading}>
              {loading && <Icons.logo className="mr-2 h-4 w-4 animate-spin" />}
              Log In
            </Button>
        )}
        <Button variant="link" size="sm" className="text-sm font-medium">Lost your phone? Lock your Account</Button>
        <div className="text-center text-sm">
          New to Zrlda?{" "}
          <Link href="/signup" className="font-semibold text-primary">
            Sign up
          </Link>
        </div>
      </CardFooter>
      <div id="recaptcha-container"></div>
    </>
  );
}
