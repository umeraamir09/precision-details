import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { EmailTemplate } from '@/app/components/email-template';
import { ConfirmationTemplate } from '@/app/components/confirmation-template';

const resend = new Resend(process.env.RESEND_API_KEY);


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, message } = body as {
      firstName: string; lastName?: string; email: string; phone?: string; message: string;
    };

    if (!firstName || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Also forward the contact payload to Make.com webhook (non-blocking for success response)
    const makePayload = {
      firstName,
      lastName: lastName || '',
      email,
      phone: phone || '',
      message,
      source: 'contact-form',
      submittedAt: new Date().toISOString(),
    };
    try {
  await fetch('https://hooks.zapier.com/hooks/catch/24980009/u5wzohj/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(makePayload),
        // Prevent Next.js from caching the webhook call
        cache: 'no-store',
      });
    } catch (webhookErr) {
      console.error('Make.com webhook error:', webhookErr);
      // Do not fail the request if webhook forwarding fails
    }

    const logoUrl = process.env.PUBLIC_BRAND_LOGO_URL || 'https://raw.githubusercontent.com/umeraamir09/precision-details/refs/heads/master/public/branding/logo.png';
    const { error } = await resend.emails.send({
      from: 'Precision Details <noreply@umroo.art>',
      to: process.env.CONTACT_TO?.split(',') || ['detailswithprecision@gmail.com'],
      subject: 'New Contact Form Submission',
      react: EmailTemplate({ firstName, lastName, email, phone, message, logoUrl }),
    });
    if (error) {
      console.error('Resend error', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    await resend.emails.send({
      from: 'Precision Details <noreply@umroo.art>',
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
