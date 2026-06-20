export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'Rachna Kranti <noreply@rachnakranti.com>',
      to: email,
      subject: 'Reset your Rachna Kranti password',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h1 style="color: #e11d48; font-size: 24px;">Reset your password</h1>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">
            You requested a password reset. Click the button below to set a new password.
            This link expires in 1 hour.
          </p>
          <a href="${resetUrl}"
             style="display: inline-block; background: #e11d48; color: white; padding: 12px 24px;
                    border-radius: 8px; text-decoration: none; font-size: 16px; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color: #6b7280; font-size: 14px;">
            If you didn't request this, ignore this email.
          </p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to send email: ${err}`);
  }
}
