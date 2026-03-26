import { ComplaintCategory, ComplaintStatus, SLA_HOURS } from '@/types';

/**
 * Get the SLA hours for a complaint category.
 */
export function getSLAHours(category: ComplaintCategory): number {
  return SLA_HOURS[category];
}

/**
 * Calculate the SLA deadline given a category and creation timestamp.
 * Returns a Date object representing the deadline.
 */
export function calculateSLADeadline(
  category: ComplaintCategory,
  createdAt: Date
): Date {
  const hours = getSLAHours(category);
  const deadline = new Date(createdAt.getTime());
  deadline.setHours(deadline.getHours() + hours);
  return deadline;
}

/**
 * Check whether the SLA has been breached.
 * An SLA is breached if the current time is past the deadline
 * AND the complaint is not yet resolved or closed.
 */
export function isSLABreached(
  sla_deadline: string,
  status: ComplaintStatus
): boolean {
  const terminalStatuses: ComplaintStatus[] = [
    ComplaintStatus.RESOLVED,
    ComplaintStatus.CLOSED,
  ];

  if (terminalStatuses.includes(status)) {
    return false;
  }

  const deadline = new Date(sla_deadline);
  return new Date() > deadline;
}

/**
 * Get the number of hours remaining until SLA deadline.
 * Returns a negative number if the deadline has already passed (breached).
 */
export function getSLARemainingHours(sla_deadline: string): number {
  const deadline = new Date(sla_deadline);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  return diffMs / (1000 * 60 * 60);
}
