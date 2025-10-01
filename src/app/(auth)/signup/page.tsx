
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
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, getDocs, collection, query, where, serverTimestamp } from "firebase/firestore";
import { seedInitialData } from "@/lib/data";

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
        // Fallback to a purely random ztag if we can't find a unique one
        finalZtag = `user.${Math.random().toString(36).substring(2, 8)}`;
    }
    
    return finalZtag;
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const newPhotoURL = `https://picsum.photos/seed/${user.uid}/100/100`;
      
      await updateProfile(user, {
        displayName: name,
        photoURL: newPhotoURL,
      });

      const ztag = await generateUniqueZtag(name);

      await setDoc(doc(db, "users", user.uid), {
        userId: user.uid,
        email: user.email,
        name: name,
        balance: 50000,
        zcashBalance: 10000,
        kycStatus: 'Not Verified',
        photoURL: newPhotoURL,
        ztag: ztag,
        phone: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ztagLastUpdated: null
      });

      await seedInitialData(user.uid);

      router.push("/dashboard");
    } catch (error: any) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('This email address is already in use by another account.');
          break;
        case 'auth/invalid-email':
          setError('The email address is not valid.');
          break;
        case 'auth/weak-password':
          setError('The password is too weak. It must be at least 6 characters long.');
          break;
        default:
          setError('An unexpected error occurred. Please try again.');
          console.error("Signup error:", error);
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create an Account</CardTitle>
        <CardDescription>
          Join Zrlda Finance and take control of your finances.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
      <CardFooter className="flex flex-col gap-4">
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleSignup} disabled={loading}>
           {loading && <Icons.logo className="mr-2 h-4 w-4 animate-spin" />}
          Sign Up
        </Button>
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline text-primary">
            Log in
          </Link>
        </div>
      </CardFooter>
    </>
  );
}
