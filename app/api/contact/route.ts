import { NextResponse } from 'next/server';
import { getResend, EMAIL_FROM, getBrandLogoUrl } from '@/lib/email';
import { EmailTemplate } from '@/app/components/email-template';
import { ConfirmationTemplate } from '@/app/components/confirmation-template';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, message } = body as {
      firstName: string; lastName?: string; email: string; phone?: string; message: string;
    };

    if (!firstName || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const resend = getResend();
    const logoUrl = getBrandLogoUrl();
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: process.env.CONTACT_TO?.split(',') || ['detailswithprecision@gmail.com'],
      subject: 'New Contact Form Submission',
      react: EmailTemplate({ firstName, lastName, email, phone, message, logoUrl }),
    });
    if (error) {
      console.error('Resend error', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    await resend.emails.send({
      from: EMAIL_FROM,
      to: [email],
      subject: 'We received your message!',
      react: ConfirmationTemplate({ firstName, logoUrl }),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Contact route error', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
