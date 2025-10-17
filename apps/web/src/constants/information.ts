// Contact information with environment variable support and fallbacks
// Uses NEXT_PUBLIC_ prefixed variables for client-safe values

function getEnvVar(key: string, fallback: string): string {
  if (typeof window === 'undefined') {
    // Server-side: use process.env
    return process.env[key] || fallback;
  } else {
    // Client-side: use NEXT_PUBLIC_ prefixed environment variables
    const publicKey = key.startsWith('NEXT_PUBLIC_')
      ? key
      : `NEXT_PUBLIC_${key}`;
    return process.env[publicKey] || fallback;
  }
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone format (basic international format)
function isValidPhone(phone: string): boolean {
  // Allow various international formats: +countrycode number
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

const rawEmail = getEnvVar(
  'NEXT_PUBLIC_CONTACT_EMAIL',
  'minhkien2208@gmail.com'
);
const rawPhone = getEnvVar('NEXT_PUBLIC_CONTACT_PHONE', '+84776978875');
const rawAddress = getEnvVar(
  'NEXT_PUBLIC_CONTACT_ADDRESS',
  'Danang City, Vietnam'
);
const rawName = getEnvVar('NEXT_PUBLIC_CONTACT_NAME', 'Ha Minh Kien');
const rawShortName = getEnvVar('NEXT_PUBLIC_CONTACT_SHORT_NAME', 'Kien Ha');

// Validate and provide fallbacks for critical fields
const email = isValidEmail(rawEmail) ? rawEmail : 'contact@example.com';
const phone = isValidPhone(rawPhone) ? rawPhone : '+1234567890';
const address = rawAddress.trim() || 'Location not specified';
const name = rawName.trim() || 'Name not specified';
const shortName = rawShortName.trim() || 'User';

export const INFORMATION = {
  shortName,
  name,
  email,
  phone,
  address,
} as const;

// Export validation status for debugging/logging
export const INFORMATION_VALIDATION = {
  emailValid: isValidEmail(email),
  phoneValid: isValidPhone(phone),
  addressValid: address !== 'Location not specified',
  nameValid: name !== 'Name not specified',
  shortNameValid: shortName !== 'User',
} as const;
