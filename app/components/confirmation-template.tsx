/* eslint-disable @next/next/no-img-element */
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
              <p style={{ margin: '8px 0 0 0', color: '#c0bbb7', fontSize: 14 }}>Hi {firstName},<br />We’ve received your message and will get back to you as soon as possible.<br /><br />If you need immediate assistance, call us at (555) 123-4567.<br /><br />- The Precision Details Team</p>
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

function formatTime12(t?: string) {
  if (!t || typeof t !== 'string') return '';
  const s = t.trim();
  if (/am|pm/i.test(s)) return s; // already formatted
  const m = s.match(/^([0-1]?\d|2[0-3]):([0-5]\d)$/);
  if (!m) return s;
  let hh = parseInt(m[1], 10);
  const mm = m[2];
  const ampm = hh >= 12 ? 'PM' : 'AM';
  hh = hh % 12;
  if (hh === 0) hh = 12;
  return `${hh}:${mm} ${ampm}`;
}

export function UpdateBookingEmailToCustomer(props: { name: string; packageName: string; date: string; time: string; notes?: string; status?: string; logoUrl?: string; }) {
  const { name, packageName, date, time, notes, status, logoUrl } = props;
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
              <h1 style={{ margin: 0, fontSize: 22, lineHeight: '28px', fontWeight: 800 }}>Your booking was updated</h1>
              <p style={{ margin: '8px 0 0 0', color: '#c0bbb7', fontSize: 14 }}>Hi {name}, here are your updated appointment details.</p>
              <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ marginTop: 16, borderCollapse: 'separate', borderSpacing: 0 }}>
                <tbody>
                  <tr>
                    <td style={cellLabelStyle}>Package</td>
                    <td style={cellValueStyle}>{packageName}</td>
                  </tr>
                  <tr>
                    <td style={cellLabelStyle}>Date</td>
                    <td style={cellValueStyle}>{date}</td>
                  </tr>
                  <tr>
                    <td style={cellLabelStyle}>Time</td>
                    <td style={cellValueStyle}>{formatTime12(time)}</td>
                  </tr>
                  {typeof status === 'string' && (
                    <tr>
                      <td style={cellLabelStyle}>Status</td>
                      <td style={cellValueStyle}>{status}</td>
                    </tr>
                  )}
                  {notes && (
                    <tr>
                      <td style={{ ...cellLabelStyle, verticalAlign: 'top' }}>Notes</td>
                      <td style={{ ...cellValueStyle, whiteSpace: 'pre-wrap' }}>{notes}</td>
                    </tr>
                  )}
                </tbody>
              </table>
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

export function CancellationEmailToCustomer(props: { name: string; packageName: string; date: string; time: string; logoUrl?: string; }) {
  const { name, packageName, date, time, logoUrl } = props;
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
              <h1 style={{ margin: 0, fontSize: 22, lineHeight: '28px', fontWeight: 800 }}>Your booking was cancelled</h1>
              <p style={{ margin: '8px 0 0 0', color: '#c0bbb7', fontSize: 14 }}>Hi {name}, your appointment has been cancelled. If this was a mistake or you want to reschedule, contact us at <a href="https://precisiondetails.co/contact/" style={{ color: '#c0bbb7', textDecoration: 'underline' }}>https://precisiondetails.co/contact/</a>.</p>
              <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ marginTop: 16, borderCollapse: 'separate', borderSpacing: 0 }}>
                <tbody>
                  <tr>
                    <td style={cellLabelStyle}>Package</td>
                    <td style={cellValueStyle}>{packageName}</td>
                  </tr>
                  <tr>
                    <td style={cellLabelStyle}>Date</td>
                    <td style={cellValueStyle}>{date}</td>
                  </tr>
                  <tr>
                    <td style={cellLabelStyle}>Time</td>
                    <td style={cellValueStyle}>{formatTime12(time)}</td>
                  </tr>
                </tbody>
              </table>
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

export function DateTimeUpdatedEmailToCustomer(props: {
  name: string;
  packageName: string;
  oldDate?: string;
  oldTime?: string;
  newDate: string;
  newTime: string;
  notes?: string;
  logoUrl?: string;
}) {
  const { name, packageName, oldDate, oldTime, newDate, newTime, notes, logoUrl } = props;
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
              <h1 style={{ margin: 0, fontSize: 22, lineHeight: '28px', fontWeight: 800 }}>Your appointment was rescheduled</h1>
              <p style={{ margin: '8px 0 0 0', color: '#c0bbb7', fontSize: 14 }}>Hi {name}, your {packageName} appointment date/time has changed. Details below.</p>
              <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ marginTop: 16, borderCollapse: 'separate', borderSpacing: 0 }}>
                <tbody>
                  {(oldDate || oldTime) && (
                    <tr>
                      <td style={cellLabelStyle}>Previous</td>
                      <td style={cellValueStyle}>{[oldDate, formatTime12(oldTime)].filter(Boolean).join(' at ')}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={cellLabelStyle}>New</td>
                    <td style={cellValueStyle}>{newDate} at {formatTime12(newTime)}</td>
                  </tr>
                  {notes && (
                    <tr>
                      <td style={{ ...cellLabelStyle, verticalAlign: 'top' }}>Notes</td>
                      <td style={{ ...cellValueStyle, whiteSpace: 'pre-wrap' }}>{notes}</td>
                    </tr>
                  )}
                </tbody>
              </table>
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

export function CompletedEmailToCustomer(props: { name: string; packageName: string; date: string; time: string; logoUrl?: string; }) {
  const { name, packageName, date, time, logoUrl } = props;
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
              <h1 style={{ margin: 0, fontSize: 22, lineHeight: '28px', fontWeight: 800 }}>Your booking is completed</h1>
              <p style={{ margin: '8px 0 0 0', color: '#c0bbb7', fontSize: 14 }}>Hi {name}, your {packageName} appointment on {date} at {formatTime12(time)} is completed. Thank you for choosing Precision Details.</p>
              <div style={{ marginTop: 16, padding: 12, backgroundColor: '#201d1a', border: '1px solid #2a2623', borderRadius: 12, color: '#c0bbb7', fontSize: 12 }}>
                Enjoy the shine! If anything needs a touch-up or you have questions, contact us at <a href="https://precisiondetails.co/contact/" style={{ color: '#c0bbb7', textDecoration: 'underline' }}>https://precisiondetails.co/contact/</a>.
              </div>
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

const cellLabelStyle: React.CSSProperties = {
  width: 120,
  padding: '10px 12px',
  fontSize: 12,
  color: '#8e8781',
  backgroundColor: '#1b1916',
  border: '1px solid #2a2623',
  borderRight: 'none',
  borderTopLeftRadius: 8,
  borderBottomLeftRadius: 8,
};

const cellValueStyle: React.CSSProperties = {
  padding: '10px 12px',
  fontSize: 14,
  color: '#ffffff',
  backgroundColor: '#151311',
  border: '1px solid #2a2623',
  borderLeft: 'none',
  borderTopRightRadius: 8,
  borderBottomRightRadius: 8,
};
