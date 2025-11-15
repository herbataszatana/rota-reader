// src/services/ics.service.ts
import { Shift } from "../types/shift.js";

interface ICSEvent {
    summary: string;
    description?: string;
    start: Date;
    end: Date;
    isAllDay?: boolean;
    alarm?: number; // minutes before
    category?: string;
}

export interface EventSettings {
    shiftReminderMinutes: number;
    restDayReminder: boolean;
    restDayReminderMinutes: number;
    eventNameFormat: 'reference' | 'custom' | 'detailed' | 'times' | 'timesWithRef';
    customPrefix?: string;
}

export function generateICS(events: ICSEvent[], employeeName: string): string {
    const lines: string[] = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Rota Reader//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        `X-WR-CALNAME:${employeeName} Shifts`,
        'X-WR-TIMEZONE:Europe/London'
    ];

    events.forEach(event => {
        lines.push('BEGIN:VEVENT');
        lines.push(`UID:${generateUID()}`);
        lines.push(`DTSTAMP:${formatDateTimeUTC(new Date())}`);

        if (event.isAllDay) {
            // All-day event format (for rest days)
            lines.push(`DTSTART;VALUE=DATE:${formatDateOnly(event.start)}`);
            lines.push(`DTEND;VALUE=DATE:${formatDateOnly(event.end)}`);
        } else {
            // Timed event format (for shifts)
            lines.push(`DTSTART:${formatDateTime(event.start)}`);
            lines.push(`DTEND:${formatDateTime(event.end)}`);
        }

        lines.push(`SUMMARY:${escapeText(event.summary)}`);

        if (event.description) {
            lines.push(`DESCRIPTION:${escapeText(event.description)}`);
        }

        // Add category based on job reference
        if (event.category) {
            lines.push(`CATEGORIES:${escapeText(event.category)}`);
        }

        // Add alarm/reminder (only for non-all-day events or if explicitly set)
        if (event.alarm && event.alarm > 0) {
            lines.push('BEGIN:VALARM');
            lines.push('ACTION:DISPLAY');
            lines.push(`DESCRIPTION:${escapeText(event.summary)}`);
            lines.push(`TRIGGER:-PT${event.alarm}M`);
            lines.push('END:VALARM');
        }

        lines.push('END:VEVENT');
    });

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
}

export function shiftsToICSEvents(shifts: Shift[], includeRestDays: boolean, settings: EventSettings): ICSEvent[] {
    const events: ICSEvent[] = [];

    shifts.forEach(shift => {
        if (shift.isRestDay) {
            if (includeRestDays) {
                // Rest day as all-day event
                const start = new Date(shift.date);
                const end = new Date(shift.date);
                end.setDate(end.getDate() + 1); // All-day events need end date as next day

                const summary = formatEventName('Rest Day (RD)', null, shift.startTime, shift.endTime, settings);

                events.push({
                    summary,
                    description: 'Rest Day',
                    start,
                    end,
                    isAllDay: true,
                    category: 'REST_DAY',
                    alarm: settings.restDayReminder ? settings.restDayReminderMinutes : undefined
                });
            }
        } else {
            // Working shift
            if (!shift.startDateTime || !shift.endDateTime) return;

            const category = determineCategory(shift.reference);
            const summary = formatEventName(shift.reference || 'Shift', shift.reference, shift.startTime, shift.endTime, settings);

            events.push({
                summary,
                description: `${shift.reference || 'Shift'} - ${shift.startTime} to ${shift.endTime}`,
                start: new Date(shift.startDateTime),
                end: new Date(shift.endDateTime),
                isAllDay: false,
                alarm: settings.shiftReminderMinutes > 0 ? settings.shiftReminderMinutes : undefined,
                category: category
            });
        }
    });

    return events;
}

function formatEventName(
    defaultName: string,
    reference: string | null,
    startTime: string | null,
    endTime: string | null,
    settings: EventSettings
): string {
    const ref = reference || defaultName;

    // Rest days are never affected by custom prefix
    if (defaultName === 'Rest Day (RD)') {
        return defaultName;
    }

    switch (settings.eventNameFormat) {
        case 'reference':
            return ref;
        case 'times':
            if (startTime && endTime) {
                return `${startTime}-${endTime}`;
            }
            return ref;
        case 'timesWithRef':
            if (startTime && endTime) {
                return `${startTime}-${endTime} (${ref})`;
            }
            return ref;
        case 'detailed':
            if (startTime && endTime) {
                return `Shift ${ref} (${startTime}-${endTime})`;
            }
            return ref;
        case 'custom':
            // Custom prefix only applies to shifts, not rest days
            return `${settings.customPrefix || ''}${ref}`;
        default:
            return ref;
    }
}

function determineCategory(reference: string | null): string {
    if (!reference) return 'SHIFT';

    // Group common job reference patterns
    const ref = reference.toUpperCase();

    if (ref.includes('A/R') || ref.startsWith('AR')) return 'AR_SHIFT';
    if (ref.match(/^\d{4}$/)) return `REF_${ref}`; // 4-digit refs like 1601
    if (ref.includes('TRAIN')) return 'TRAINING';
    if (ref.includes('MEET')) return 'MEETING';

    // Default: use the reference itself as category
    return ref.replace(/[^A-Z0-9_]/g, '_');
}

function formatDateTime(date: Date): string {
    // Format: YYYYMMDDTHHmmss (local time)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

function formatDateTimeUTC(date: Date): string {
    // Format: YYYYMMDDTHHmmssZ (UTC)
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function formatDateOnly(date: Date): string {
    // Format: YYYYMMDD (for all-day events)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}${month}${day}`;
}

function escapeText(text: string): string {
    return text
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n');
}

function generateUID(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@rotareader.com`;
}