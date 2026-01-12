/**
 * Centralized booking business rules
 * All times are in America/Chicago timezone
 */

export const BOOKING_TIMEZONE = 'America/Chicago';
export const BOOKING_DURATION_MINUTES = 210; // 3 hours 30 minutes

// Business hours configuration
export const WEEKDAY_HOURS = {
  start: { hour: 15, minute: 30 }, // 3:30 PM
  end: { hour: 20, minute: 0 },    // 8:00 PM (latest booking end)
} as const;

export const WEEKEND_HOURS = {
  start: { hour: 9, minute: 0 },   // 9:00 AM
  end: { hour: 20, minute: 0 },    // 8:00 PM
} as const;

export const SLOT_INCREMENT_MINUTES = 30;

/**
 * Check if a given date is a weekend (Sat/Sun)
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Check if a given date string (YYYY-MM-DD) is a weekend
 */
export function isWeekendStr(dateStr: string): boolean {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  return isWeekend(dt);
}

/**
 * Get business hours for a given date
 */
export function getBusinessHours(date: Date) {
  return isWeekend(date) ? WEEKEND_HOURS : WEEKDAY_HOURS;
}

/**
 * Convert time string (HH:mm) to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Convert minutes since midnight to time string (HH:mm)
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Generate available time slots for a given date
 * Returns an array of time strings (HH:mm)
 */
export function getAvailableSlots(date: Date): string[] {
  const hours = getBusinessHours(date);
  const startMinutes = hours.start.hour * 60 + hours.start.minute;
  const endMinutes = hours.end.hour * 60 + hours.end.minute;
  
  // Latest possible start time: end - booking duration
  const latestStartMinutes = endMinutes - BOOKING_DURATION_MINUTES;
  
  const slots: string[] = [];
  let current = startMinutes;
  
  while (current <= latestStartMinutes) {
    slots.push(minutesToTime(current));
    current += SLOT_INCREMENT_MINUTES;
  }
  
  return slots;
}

/**
 * Validate a booking time slot
 * Returns { valid: true } or { valid: false, reason: string }
 */
export function validateBookingSlot(
  dateStr: string,
  timeStr: string
): { valid: boolean; reason?: string } {
  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return { valid: false, reason: 'Invalid date format (expected YYYY-MM-DD)' };
  }
  
  // Validate time format
  if (!/^\d{2}:\d{2}$/.test(timeStr)) {
    return { valid: false, reason: 'Invalid time format (expected HH:mm)' };
  }
  
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  
  // Check if date is in the past (using Chicago timezone would be better but for server validation this is acceptable)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bookingDate = new Date(y, m - 1, d);
  bookingDate.setHours(0, 0, 0, 0);
  
  if (bookingDate < today) {
    return { valid: false, reason: 'Cannot book in the past' };
  }
  
  const hours = getBusinessHours(date);
  const startMinutes = hours.start.hour * 60 + hours.start.minute;
  const endMinutes = hours.end.hour * 60 + hours.end.minute;
  const latestStartMinutes = endMinutes - BOOKING_DURATION_MINUTES;
  
  const slotMinutes = timeToMinutes(timeStr);
  
  // Check if within business hours
  if (slotMinutes < startMinutes) {
    return { 
      valid: false, 
      reason: `Bookings start at ${formatTime12h(minutesToTime(startMinutes))}` 
    };
  }
  
  // Check if booking would extend past closing
  if (slotMinutes > latestStartMinutes) {
    const endTime = slotMinutes + BOOKING_DURATION_MINUTES;
    const closingTime = formatTime12h(minutesToTime(endMinutes));
    return { 
      valid: false, 
      reason: `Booking would end at ${formatTime12h(minutesToTime(endTime))}, past closing time (${closingTime})` 
    };
  }
  
  // Check if slot is on a valid increment
  if ((slotMinutes - startMinutes) % SLOT_INCREMENT_MINUTES !== 0) {
    return { valid: false, reason: 'Invalid time slot increment' };
  }
  
  return { valid: true };
}

/**
 * Format 24h time (HH:mm) to 12h format
 */
export function formatTime12h(time: string): string {
  const [hStr, mStr] = time.split(':');
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${mStr} ${ampm}`;
}

/**
 * Check if two time slots overlap given the booking duration
 */
export function slotsOverlap(
  time1: string,
  time2: string,
  duration: number = BOOKING_DURATION_MINUTES
): boolean {
  const start1 = timeToMinutes(time1);
  const end1 = start1 + duration;
  const start2 = timeToMinutes(time2);
  const end2 = start2 + duration;
  
  return start1 < end2 && start2 < end1;
}

/**
 * Filter out slots that overlap with existing bookings
 */
export function filterAvailableSlots(
  allSlots: string[],
  existingBookingTimes: string[]
): string[] {
  return allSlots.filter(slot => {
    for (const existing of existingBookingTimes) {
      if (slotsOverlap(slot, existing)) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Get why a slot is unavailable (for UI feedback)
 */
export function getSlotUnavailabilityReason(
  date: Date,
  timeStr: string,
  existingBookingTimes: string[]
): string | null {
  const hours = getBusinessHours(date);
  const startMinutes = hours.start.hour * 60 + hours.start.minute;
  const endMinutes = hours.end.hour * 60 + hours.end.minute;
  const latestStartMinutes = endMinutes - BOOKING_DURATION_MINUTES;
  const slotMinutes = timeToMinutes(timeStr);
  
  // Check business hours
  if (slotMinutes < startMinutes) {
    return 'Before opening hours';
  }
  
  if (slotMinutes > latestStartMinutes) {
    return 'Would end after closing';
  }
  
  // Check overlap with existing bookings
  for (const existing of existingBookingTimes) {
    if (slotsOverlap(timeStr, existing)) {
      return 'Conflicts with existing booking';
    }
  }
  
  return null;
}
