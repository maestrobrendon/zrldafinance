
import { NextResponse } from 'next/server';
import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise';

const GCP_PROJECT_ID = "amiable-variety-473819-k1";
const RECAPTCHA_SITE_KEY = "6Lezi90rAAAAAMuN5llIGC-8Tq7gcONr1RcBx9H_";

// Create the reCAPTCHA client.
// It's recommended to cache this client object to avoid creating a new one for each request.
const client = new RecaptchaEnterpriseServiceClient();

export async function POST(request: Request) {
  try {
    const { token, action } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, message: "reCAPTCHA token not found." }, { status: 400 });
    }

    const projectPath = client.projectPath(GCP_PROJECT_ID);

    // Build the assessment request.
    const assessmentRequest = {
      assessment: {
        event: {
          token: token,
          siteKey: RECAPTCHA_SITE_KEY,
          expectedAction: action,
        },
      },
      parent: projectPath,
    };

    const [ response ] = await client.createAssessment(assessmentRequest);

    // Check if the token is valid.
    if (!response.tokenProperties?.valid) {
      console.log(`The CreateAssessment call failed because the token was: ${response.tokenProperties?.invalidReason}`);
      return NextResponse.json({ success: false, message: `Invalid token: ${response.tokenProperties?.invalidReason}` }, { status: 400 });
    }

    // Check if the expected action was executed.
    if (response.tokenProperties?.action === action) {
      console.log(`The reCAPTCHA score is: ${response.riskAnalysis?.score}`);
      response.riskAnalysis?.reasons?.forEach((reason) => {
        console.log(reason);
      });

      // For this prototype, we'll consider any valid token a success.
      // In a real app, you would check the score and reasons to make a risk-based decision.
      // For example: if (response.riskAnalysis.score > 0.5) { ... }
      return NextResponse.json({ 
        success: true, 
        score: response.riskAnalysis?.score 
      });

    } else {
      console.log("The action attribute in your reCAPTCHA tag does not match the action you are expecting to score");
      return NextResponse.json({ success: false, message: "reCAPTCHA action mismatch." }, { status: 400 });
    }
  } catch (error) {
    console.error("Error during reCAPTCHA assessment:", error);
    return NextResponse.json({ success: false, message: "An internal server error occurred." }, { status: 500 });
  }
}
