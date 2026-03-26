/**
 * Generate a complaint UID in the format: NYC-YYYYMMDD-XXXXX
 * Example: NYC-20260325-00042
 */
export function generateComplaintUID(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // Generate a random 5-digit number (00001–99999)
  const randomNum = Math.floor(Math.random() * 99999) + 1;
  const serialStr = String(randomNum).padStart(5, '0');

  return `NYC-${dateStr}-${serialStr}`;
}

/**
 * Format a date string to human-readable format in Delhi timezone (IST).
 * Example: "25 Mar 2026, 12:30 PM"
 */
export function formatDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Mask a phone number to show only the last 4 digits.
 * Example: "9876543210" → "******3210"
 */
export function maskPhone(phone: string): string {
  if (phone.length <= 4) {
    return phone;
  }
  const visible = phone.slice(-4);
  const masked = '*'.repeat(phone.length - 4);
  return `${masked}${visible}`;
}
