/* eslint-disable @next/next/no-img-element */
import * as React from 'react';

export function BookingEmailToOwner(props: {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  carModel?: string;
  packageName: string;
  date: string;
  time: string;
  logoUrl?: string;
  locationType?: 'my' | 'shop';
  locationAddress?: string | null;
}) {
  const { name, email, phone, notes, carModel, packageName, date, time, logoUrl, locationType, locationAddress } = props;
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
              <h1 style={{ margin: 0, fontSize: 22, lineHeight: '28px', fontWeight: 800 }}>New booking</h1>
              <p style={{ margin: '8px 0 0 0', color: '#c0bbb7', fontSize: 14 }}>A customer booked an appointment.</p>
              <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ marginTop: 16, borderCollapse: 'separate', borderSpacing: 0 }}>
                <tbody>
                  <tr>
                    <td style={cellLabelStyle}>Name</td>
                    <td style={cellValueStyle}>{name}</td>
                  </tr>
                  <tr>
                    <td style={cellLabelStyle}>Email</td>
                    <td style={cellValueStyle}><a href={`mailto:${email}`} style={linkStyle}>{email}</a></td>
                  </tr>
                  <tr>
                    <td style={cellLabelStyle}>Phone</td>
                    <td style={cellValueStyle}>{phone || '—'}</td>
                  </tr>
                  <tr>
                    <td style={cellLabelStyle}>Package</td>
                    <td style={cellValueStyle}>{packageName}</td>
                  </tr>
                  <tr>
                    <td style={cellLabelStyle}>Vehicle</td>
                    <td style={cellValueStyle}>{carModel || '—'}</td>
                  </tr>
                  <tr>
                    <td style={cellLabelStyle}>Date</td>
                    <td style={cellValueStyle}>{date}</td>
                  </tr>
                  <tr>
                    <td style={cellLabelStyle}>Time</td>
                    <td style={cellValueStyle}>{time}</td>
                  </tr>
                  <tr>
                    <td style={cellLabelStyle}>Location</td>
                    <td style={cellValueStyle}>{locationType === 'shop' ? 'Precision Details (shop)' : 'Customer address'}</td>
                  </tr>
                  {locationType === 'my' && (
                    <tr>
                      <td style={{ ...cellLabelStyle, verticalAlign: 'top' }}>Address</td>
                      <td style={{ ...cellValueStyle, whiteSpace: 'pre-wrap' }}>{locationAddress || '—'}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ ...cellLabelStyle, verticalAlign: 'top' }}>Notes</td>
                    <td style={{ ...cellValueStyle, whiteSpace: 'pre-wrap' }}>{notes || '—'}</td>
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

export function BookingEmailToCustomer(props: { name: string; packageName: string; date: string; time: string; logoUrl?: string; carModel?: string; locationType?: 'my' | 'shop'; locationAddress?: string | null; }) {
  const { name, packageName, date, time, logoUrl, carModel, locationType, locationAddress } = props;
  const shop = {
    name: process.env.SHOP_NAME || 'Precision Details',
    phone: process.env.SHOP_PHONE || '331-307-8784',
    email: process.env.SHOP_EMAIL || 'contact@precisiondetails.co',
    address: process.env.SHOP_ADDRESS || '1234 Detailing Ave, Suite 200, Chicago, IL 60601',
  };
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
              <h1 style={{ margin: 0, fontSize: 22, lineHeight: '28px', fontWeight: 800 }}>Thanks for your booking</h1>
              <p style={{ margin: '8px 0 0 0', color: '#c0bbb7', fontSize: 14 }}>Hi {name}, your appointment is received. We will see you then!</p>
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
                    <td style={cellValueStyle}>{time}</td>
                  </tr>
                  {carModel && (
                    <tr>
                      <td style={cellLabelStyle}>Vehicle</td>
                      <td style={cellValueStyle}>{carModel}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {locationType === 'shop' ? (
                <div style={{ marginTop: 16, padding: 12, backgroundColor: '#201d1a', border: '1px solid #2a2623', borderRadius: 12, color: '#c0bbb7', fontSize: 13 }}>
                  <div style={{ color: '#ffffff', fontWeight: 700, marginBottom: 6 }}>{shop.name}</div>
                  <div><strong>Phone:</strong> {shop.phone}</div>
                  <div><strong>Email:</strong> <a href={`mailto:${shop.email}`} style={linkStyle}>{shop.email}</a></div>
                  <div><strong>Address:</strong> {shop.address}</div>
                </div>
              ) : (
                <div style={{ marginTop: 16, padding: 12, backgroundColor: '#201d1a', border: '1px solid #2a2623', borderRadius: 12, color: '#c0bbb7', fontSize: 13 }}>
                  <div style={{ color: '#ffffff', fontWeight: 700, marginBottom: 6 }}>Service location</div>
                  <div><strong>Your address:</strong> {locationAddress || '—'}</div>
                </div>
              )}
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

const linkStyle: React.CSSProperties = {
  color: '#fb6703',
  textDecoration: 'none',
};
