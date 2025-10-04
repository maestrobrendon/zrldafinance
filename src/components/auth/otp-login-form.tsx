
"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Icons } from "@/components/icons";
import { useAuth } from "@/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";

const phoneSchema = z.object({
  phone: z.string().min(10, "Please enter a valid 10-digit phone number."),
});

const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits."),
});

type OtpLoginFormProps = {
  onSuccess: (phone?: string) => void;
};

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export function OtpLoginForm({ onSuccess }: OtpLoginFormProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [countdown, setCountdown] = useState(0);
  const auth = useAuth();

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          // console.log("reCAPTCHA solved");
        }
      });
      window.recaptchaVerifier.render().catch(err => {
        console.error("reCAPTCHA render error:", err);
      });
    }
  }, [auth]);
  
   useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);


  const onSendOtp = async (data: z.infer<typeof phoneSchema>) => {
    setLoading(true);
    setError(null);
    try {
      const appVerifier = window.recaptchaVerifier!;
      let phoneNumberRaw = data.phone.replace(/\D/g, "");
      if (phoneNumberRaw.startsWith('0')) {
        phoneNumberRaw = phoneNumberRaw.substring(1);
      }
      const formattedPhoneNumber = `+234${phoneNumberRaw}`;
      const result = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
      setConfirmationResult(result);
      setStep("otp");
      setCountdown(60);
    } catch (error: any) {
      console.error("OTP Send Error: ", error);
      setError("Failed to send OTP. Please check the number and try again.");
      // @ts-ignore
      if (window.recaptchaVerifier && typeof grecaptcha !== 'undefined') {
        // @ts-ignore
        window.recaptchaVerifier.render().then((widgetId) => grecaptcha.reset(widgetId));
      }
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async (data: z.infer<typeof otpSchema>) => {
    if (!confirmationResult) {
      setError("An error occurred. Please try sending the OTP again.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await confirmationResult.confirm(data.otp);
      onSuccess(result.user.phoneNumber || undefined);
    } catch (error: any) {
      console.error("OTP Verify Error: ", error);
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    phoneForm.handleSubmit(onSendOtp)();
  };

  return (
    <div className="w-full">
      <div id="recaptcha-container"></div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === "phone" && (
        <Form {...phoneForm}>
          <form onSubmit={phoneForm.handleSubmit(onSendOtp)} className="space-y-6">
            <FormField
              control={phoneForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                   <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" className="shrink-0">🇳🇬 +234</Button>
                    <FormControl>
                        <Input placeholder="8012345678" {...field} />
                    </FormControl>
                   </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Icons.logo className="mr-2 h-4 w-4 animate-spin" />}
              Send OTP
            </Button>
          </form>
        </Form>
      )}

      {step === "otp" && (
        <Form {...otpForm}>
          <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} className="space-y-6">
            <FormField
              control={otpForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter OTP</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup className="w-full justify-between">
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormDescription>
                    Enter the 6-digit code sent to your phone.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="flex justify-between items-center text-sm">
                <Button 
                    type="button" 
                    variant="link" 
                    onClick={handleResend} 
                    disabled={countdown > 0 || loading}
                    className="p-0"
                >
                    Resend OTP
                </Button>
                 {countdown > 0 && (
                    <span className="text-muted-foreground">
                        in {countdown}s
                    </span>
                 )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Icons.logo className="mr-2 h-4 w-4 animate-spin" />}
              Verify & Proceed
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}

    