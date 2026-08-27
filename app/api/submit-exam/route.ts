import { NextResponse } from "next/server";
import { Resend } from "resend";
import type { SubmitExamRequest, SubmitExamResponse } from "@/lib/types";

// Lazy-initialize Resend client to avoid build-time errors
let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

const RECIPIENT_EMAIL = process.env.EXAM_SUBMISSION_EMAIL;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

export async function POST(request: Request): Promise<NextResponse<SubmitExamResponse>> {
  try {
    // Require both an API key and a configured recipient. Falling back to a
    // placeholder recipient would report success while the submission is silently
    // lost (the admin never receives it).
    const resend = getResendClient();
    if (!resend || !RECIPIENT_EMAIL) {
      console.warn(
        "Email service not configured - set both RESEND_API_KEY and EXAM_SUBMISSION_EMAIL"
      );
      return NextResponse.json({
        success: false,
        error: "Email service not configured. Please contact the administrator.",
      });
    }

    const body: SubmitExamRequest = await request.json();
    const { pdfBase64, metadata, pageCount } = body;

    // Validation
    if (!pdfBase64 || !metadata?.category) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert base64 to buffer for attachment
    const pdfBuffer = Buffer.from(pdfBase64, "base64");

    // Check size (Resend limit is 40MB)
    const sizeMB = pdfBuffer.length / (1024 * 1024);
    if (sizeMB > 35) {
      return NextResponse.json(
        { success: false, error: `PDF too large (${sizeMB.toFixed(1)}MB). Maximum is 35MB.` },
        { status: 400 }
      );
    }

    // Generate filename
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `exam-cat${metadata.category}-${timestamp}.pdf`;

    // Build email body
    const emailBody = `
New exam submission received:

Category: ${metadata.category}
${metadata.year ? `Year: ${metadata.year}` : "Year: Not specified"}
${metadata.email ? `Contact Email: ${metadata.email}` : "Contact Email: Not provided"}
Pages: ${pageCount}
PDF Size: ${sizeMB.toFixed(2)} MB

Submitted at: ${new Date().toISOString()}
    `.trim();

    // Send email with Resend
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: RECIPIENT_EMAIL,
      // Reply goes to whoever submitted, not to FROM_EMAIL — that is a sending
      // address on the verified domain, not a monitored mailbox. Spread
      // conditionally: the contact email is optional, and an explicit
      // `replyTo: undefined` is not something to rely on the SDK ignoring.
      ...(metadata.email ? { replyTo: metadata.email } : {}),
      subject: `Submissão de exame - Categoria ${metadata.category}${metadata.year ? ` (${metadata.year})` : ""}`,
      text: emailBody,
      attachments: [
        {
          filename,
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
    });
  } catch (err) {
    console.error("Submit exam error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
