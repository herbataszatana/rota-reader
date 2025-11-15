// src/services/ics.service.ts
import { Shift } from "../types/shift.js";

interface ICSEvent {
    summary: string;
    description?: string;
    start: Date;
    end: Date;
    isAllDay?: boolean;
    alarm?: number; // minutes before
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

        // Add alarm/reminder (only for non-all-day events)
        if (event.alarm && !event.isAllDay) {
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

export function shiftsToICSEvents(shifts: Shift[], includeRestDays: boolean): ICSEvent[] {
    const events: ICSEvent[] = [];

    shifts.forEach(shift => {
        if (shift.isRestDay) {
            if (includeRestDays) {
                // Rest day as all-day event
                const start = new Date(shift.date);
                const end = new Date(shift.date);
                end.setDate(end.getDate() + 1); // All-day events need end date as next day

                events.push({
                    summary: 'Rest Day (RD)',
                    description: 'Rest Day',
                    start,
                    end,
                    isAllDay: true
                    // No alarm for rest days
                });
            }
        } else {
            // Working shift
            if (!shift.startDateTime || !shift.endDateTime) return;

            events.push({
                summary: shift.reference || 'Shift',
                description: `${shift.reference || 'Shift'} - ${shift.startTime} to ${shift.endTime}`,
                start: new Date(shift.startDateTime),
                end: new Date(shift.endDateTime),
                isAllDay: false,
                alarm: 60 // 1 hour before
            });
        }
    });

    return events;
}

function formatDateTime(date: Date): string {
    // Format: YYYYMMDDTHHmmssZ (UTC)
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