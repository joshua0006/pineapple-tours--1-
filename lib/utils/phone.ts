/**
 * Formats a phone number for display
 * @param phoneNumber - The raw phone number string
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, "");

  // Handle Australian mobile numbers (starting with 04)
  if (digits.startsWith("04") && digits.length === 10) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }

  // Handle Australian landline numbers (with area code)
  if (digits.length === 10 && digits.startsWith("0")) {
    return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
  }

  // Return original if no formatting rules match
  return phoneNumber;
}

/**
 * Validates if a phone number is valid
 * @param phoneNumber - The phone number to validate
 * @returns Boolean indicating if the phone number is valid
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  const digits = phoneNumber.replace(/\D/g, "");

  // Australian mobile (04xx xxx xxx) or landline (0x xxxx xxxx)
  return digits.length === 10 && digits.startsWith("0");
}

/**
 * Converts phone number to a callable format (tel: link)
 * @param phoneNumber - The phone number string
 * @returns Phone number formatted for tel: links
 */
export function getCallablePhoneNumber(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, "");
  return `+61${digits.slice(1)}`; // Convert Australian format to international
}
