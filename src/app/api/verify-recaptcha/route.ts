
import { NextResponse } from 'next/server';

// IMPORTANT: Store your API key in environment variables in a real application.
// For this prototype, we will use the one from your firebase config.
const FIREBASE_API_KEY = "AIzaSyBv8Nl2Q1m4w-Dzh8R7Gnyng1nEdXgMNqg"; 
const RECAPTCHA_SITE_KEY = "6Lezi90rAAAAAMuN5llIGC-8Tq7gcONr1RcBx9H_";
const GCP_PROJECT_ID = "amiable-variety-473819-k1";


export async function POST(request: Request) {
  try {
    const { token, action } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, message: "reCAPTCHA token not found." }, { status: 400 });
    }

    const verificationUrl = `https://recaptchaenterprise.googleapis.com/v1/projects/${GCP_PROJECT_ID}/assessments?key=${FIREBASE_API_KEY}`;

    const verificationRequest = {
        event: {
            token: token,
            siteKey: RECAPTCHA_SITE_KEY,
            expectedAction: action,
        },
    };

    const googleResponse = await fetch(verificationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verificationRequest),
    });

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
        console.error("Google reCAPTCHA verification failed:", data);
        return NextResponse.json({ success: false, message: "reCAPTCHA verification failed.", error: data }, { status: 500 });
    }
    
    // For now, we will consider any valid assessment a success.
    // In a real app, you would check data.riskAnalysis.score and data.tokenProperties.valid
    if (data.tokenProperties && data.tokenProperties.valid) {
        return NextResponse.json({ 
            success: true, 
            message: "reCAPTCHA verified successfully.",
            score: data.riskAnalysis?.score,
            action: data.tokenProperties.action
        });
    } else {
         return NextResponse.json({ success: false, message: "Invalid reCAPTCHA token." }, { status: 400 });
    }

  } catch (error) {
    console.error("Error during reCAPTCHA verification:", error);
    return NextResponse.json({ success: false, message: "An internal server error occurred." }, { status: 500 });
  }
}
