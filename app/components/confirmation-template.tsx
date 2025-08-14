import * as React from 'react';

export function ConfirmationTemplate({ firstName, logoUrl }: { firstName: string; logoUrl?: string }) {
  return (
    <div style={{ backgroundColor: '#0f0e0d', color: '#ffffff', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'", padding: '24px' }}>
      <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: 640, margin: '0 auto', backgroundColor: '#151311', borderRadius: 16, overflow: 'hidden', border: '1px solid #2a2623' }}>
        <tbody>
          <tr>
            <td style={{ padding: 24, background: 'linear-gradient(90deg, rgba(251,103,3,0.08), rgba(251,103,3,0.02))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {logoUrl ? (
                  <img src={logoUrl} width={140} height={48} alt="Precision Details" style={{ display: 'block' }} />
                ) : (
                  <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 0.5 }}>Precision Details</div>
                )}
              </div>
            </td>
          </tr>
          <tr>
            <td style={{ padding: '8px 24px' }}>
              <div style={{ height: 1, width: '100%', backgroundColor: '#2a2623' }} />
            </td>
          </tr>
          <tr>
            <td style={{ padding: 24 }}>
              <h1 style={{ margin: 0, fontSize: 22, lineHeight: '28px', fontWeight: 800 }}>Thank you for contacting us!</h1>
              <p style={{ margin: '8px 0 0 0', color: '#c0bbb7', fontSize: 14 }}>Hi {firstName},<br />We’ve received your message and will get back to you as soon as possible.<br /><br />If you need immediate assistance, call us at (555) 123-4567.<br /><br />— The Precision Details Team</p>
            </td>
          </tr>
          <tr>
            <td style={{ padding: 16, textAlign: 'center', backgroundColor: '#100e0d', borderTop: '1px solid #2a2623', color: '#8e8781', fontSize: 12 }}>
              © {new Date().getFullYear()} Precision Details
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
