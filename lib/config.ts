/**
 * Business configuration
 * Centralized location for business-specific constants
 */

export const BUSINESS_INFO = {
  name: 'Precision Details',
  phone: '+1 331 307 8784',
  email: 'contact@precisiondetails.co',
  address: {
    street: '1137 Heather Lane',
    city: 'Glen Ellyn',
    state: 'IL',
    zip: '60137',
    country: 'USA',
  },
  fullAddress: 'Glen Ellyn, IL 1137 Heather Lane',
} as const;

/**
 * Get formatted full address
 */
export function getFullAddress(): string {
  const { street, city, state, zip } = BUSINESS_INFO.address;
  return `${street}, ${city}, ${state} ${zip}`;
}
