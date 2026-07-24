import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import type { EmailConfig } from "@convex-dev/auth/server";

const resetEmail: EmailConfig = {
  id: "password-reset",
  type: "email",
  name: "Password reset",
  from: process.env.AUTH_EMAIL_FROM ?? "Atlas <onboarding@resend.dev>",
  maxAge: 60 * 60,
  sendVerificationRequest: async ({ identifier, url, provider }) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
    const resetUrl = new URL(url);
    resetUrl.searchParams.set("email", identifier);
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: provider.from,
        to: [identifier],
        subject: "Reset your Atlas password",
        html: `<p>We received a request to reset your Atlas password.</p><p><a href="${resetUrl.toString()}">Reset your password</a></p><p>This link expires in one hour. If you did not request this, you can ignore this email.</p>`,
      }),
    });
    if (!response.ok) {
      throw new Error(`Password reset email failed: ${response.status}`);
    }
  },
};

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password({ reset: resetEmail })],
});
