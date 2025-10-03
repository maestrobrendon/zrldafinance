
"use client";

import Link from "next/link";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { auth } from "@/lib/firebase";
import {
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  onAuthStateChanged,
  type User,
  type MultiFactorUser,
  type PhoneMultiFactorInfo,
} from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: any;
  }
}

export default function SecuritySettingsPage() {
    const { toast } = useToast();
    const [user, setUser] = React.useState<MultiFactorUser | null>(null);
    const [enrolledFactors, setEnrolledFactors] = React.useState<PhoneMultiFactorInfo[]>([]);
    const [mfaDialogOpen, setMfaDialogOpen] = React.useState(false);
    const [step, setStep] = React.useState<'phone' | 'otp'>('phone');
    const [phoneNumber, setPhoneNumber] = React.useState("");
    const [verificationCode, setVerificationCode] = React.useState("");
    const [verificationId, setVerificationId] = React.useState<string | null>(null);
    const [isVerifying, setIsVerifying] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                const multiFactorUser = multiFactor(currentUser as User);
                setUser(multiFactorUser);
                setEnrolledFactors(multiFactorUser.enrolledFactors.filter(f => f.factorId === 'phone') as PhoneMultiFactorInfo[]);
            } else {
                setUser(null);
                setEnrolledFactors([]);
            }
        });
        return () => unsubscribe();
    }, []);

    React.useEffect(() => {
        if (mfaDialogOpen && !window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': () => {
                    // reCAPTCHA solved
                }
            });
            window.recaptchaVerifier.render();
        }
    }, [mfaDialogOpen]);

    const resetMfaDialog = () => {
        setMfaDialogOpen(false);
        setTimeout(() => {
            setStep('phone');
            setPhoneNumber('');
            setVerificationCode('');
            setVerificationId(null);
            setError(null);
            setIsVerifying(false);
        }, 300);
    };

    const handleSendVerificationCode = async () => {
        setError(null);
        setIsVerifying(true);
        if (!user || !window.recaptchaVerifier) {
            setError("User or reCAPTCHA not initialized.");
            setIsVerifying(false);
            return;
        }

        try {
            const multiFactorSession = await multiFactor(user).getSession();
            const phoneInfoOptions = {
                phoneNumber: `+234${phoneNumber.replace(/\D/g, '')}`,
                session: multiFactorSession
            };
            const phoneAuthProvider = new PhoneAuthProvider(auth);
            const verId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, window.recaptchaVerifier);

            setVerificationId(verId);
            setStep('otp');
        } catch (err: any) {
            console.error("MFA SMS Error:", err);
            setError(err.message || "Failed to send verification code. Please check the number and try again.");
            // @ts-ignore
            if (typeof grecaptcha !== 'undefined') {
                // @ts-ignore
                window.recaptchaVerifier.render().then((widgetId) => grecaptcha.reset(widgetId));
            }
        } finally {
            setIsVerifying(false);
        }
    };

    const handleEnrollMfa = async () => {
        setError(null);
        setIsVerifying(true);
        if (!user || !verificationId) {
            setError("Verification session is invalid. Please try again.");
            setIsVerifying(false);
            return;
        }

        try {
            const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
            const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
            await multiFactor(user).enroll(multiFactorAssertion, `My Phone (${phoneNumber.slice(-4)})`);

            // Update local state to reflect new enrollment
            const updatedUser = multiFactor(auth.currentUser as User);
            setEnrolledFactors(updatedUser.enrolledFactors.filter(f => f.factorId === 'phone') as PhoneMultiFactorInfo[]);
            
            toast({
                title: "MFA Enabled!",
                description: "You've successfully enabled multi-factor authentication."
            });
            resetMfaDialog();
        } catch (err: any) {
            console.error("MFA Enroll Error:", err);
            setError(err.message || "Invalid verification code.");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="space-y-8">
            <div id="recaptcha-container"></div>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" asChild>
                    <Link href="/settings"><Icons.arrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Security</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your PIN, biometrics, and 2FA.
                    </p>
                </div>
            </div>

             <Card>
                <CardHeader>
                    <CardTitle>Login & Recovery</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="create-pin">Change PIN</Label>
                            <p className="text-sm text-muted-foreground">
                            Update your 4-digit transaction PIN.
                            </p>
                        </div>
                        <Button variant="outline">Change PIN</Button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="biometrics">Enable Biometrics</Label>
                            <p className="text-sm text-muted-foreground">
                            Use Face ID or fingerprint for login.
                            </p>
                        </div>
                        <Switch id="biometrics" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Two-Factor Authentication</Label>
                            <p className="text-sm text-muted-foreground">
                                {enrolledFactors.length > 0 ? `Enabled on ${enrolledFactors.length} device(s)` : 'Not enabled.'}
                            </p>
                        </div>
                        <Dialog open={mfaDialogOpen} onOpenChange={setMfaDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    {enrolledFactors.length > 0 ? 'Manage' : 'Enable'}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        {step === 'phone' ? 'Enable Two-Factor Authentication' : 'Enter Verification Code'}
                                    </DialogTitle>
                                </DialogHeader>

                                {error && (
                                    <Alert variant="destructive">
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                {step === 'phone' ? (
                                    <div className="space-y-4 py-4">
                                        <p className="text-sm text-muted-foreground">
                                            Enter the phone number you'd like to use for multi-factor authentication. A verification code will be sent via SMS.
                                        </p>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" className="shrink-0">🇳🇬 +234</Button>
                                                <Input id="phone" type="tel" placeholder="801 234 5678" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 py-4">
                                         <p className="text-sm text-muted-foreground">
                                            A 6-digit code was sent to +234{phoneNumber}.
                                        </p>
                                        <div className="space-y-2">
                                            <Label htmlFor="otp">Verification Code</Label>
                                            <Input id="otp" type="text" placeholder="123456" required value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} />
                                        </div>
                                    </div>
                                )}
                                
                                <DialogFooter>
                                    <Button type="button" variant="secondary" onClick={resetMfaDialog}>Cancel</Button>
                                    {step === 'phone' ? (
                                        <Button onClick={handleSendVerificationCode} disabled={isVerifying || phoneNumber.length < 10}>
                                            {isVerifying && <Icons.logo className="mr-2 h-4 w-4 animate-spin" />}
                                            Send Code
                                        </Button>
                                    ) : (
                                        <Button onClick={handleEnrollMfa} disabled={isVerifying || verificationCode.length < 6}>
                                            {isVerifying && <Icons.logo className="mr-2 h-4 w-4 animate-spin" />}
                                            Verify & Enable
                                        </Button>
                                    )}
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                     {enrolledFactors.length > 0 && (
                        <div className="pl-4 pt-2 space-y-2">
                            {enrolledFactors.map((factor, i) => (
                                <div key={i} className="text-sm text-muted-foreground">
                                    <span className="font-semibold text-foreground">Phone:</span> {factor.phoneNumber}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Devices & Sessions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="border rounded-lg p-4">
                         <p className="font-medium">iPhone 14 Pro Max</p>
                         <p className="text-sm text-green-500">This device</p>
                    </div>
                     <div className="border rounded-lg p-4 flex justify-between items-center">
                        <div>
                            <p className="font-medium">Macbook Pro</p>
                            <p className="text-sm text-muted-foreground">Last seen: 2 days ago</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-destructive">Remove</Button>
                    </div>
                    <Button variant="destructive" className="w-full">Logout from all devices</Button>
                </CardContent>
            </Card>

        </div>
    )
}
