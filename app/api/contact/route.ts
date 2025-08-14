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

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || '';
    const logoUrl = 'https://i.ibb.co/RGN01wZh/Artboard-1072x72.png';

    // Send to site owner
    const { error } = await resend.emails.send({
      from: 'Precision Details <noreply@umroo.art>',
      to: process.env.CONTACT_TO?.split(',') || ['umroo.aamir@gmail.com'],
      subject: 'New Contact Form Submission',
      react: EmailTemplate({ firstName, lastName, email, phone, message, logoUrl }),
    });
    if (error) {
      console.error('Resend error', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    // Send confirmation to customer
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
