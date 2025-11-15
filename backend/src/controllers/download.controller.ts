// src/controllers/download.controller.ts
import type { FastifyRequest, FastifyReply } from "fastify";
import { getEmployeeShiftData } from "../services/employee.service.js";
import { generateICS, shiftsToICSEvents, EventSettings } from "../services/ics.service.js";
import { getUploadedFilePath } from "../state/upload.state.js";
import type { EmployeeSelection } from "../types/employee.types.js";

interface DownloadRequest {
    employeeData: EmployeeSelection;
    includeRestDays: boolean;
    type: 'all' | 'month' | 'single';
    eventSettings: EventSettings;
    singleShift?: any; // For single shift download
    monthFilter?: {
        month: number; // 0-11
        year: number;
    };
}

export async function handleDownloadShifts(
    request: FastifyRequest<{ Body: DownloadRequest }>,
    reply: FastifyReply
) {
    const { employeeData, includeRestDays, type, monthFilter, eventSettings, singleShift } = request.body;

    const filePath = getUploadedFilePath();
    if (!filePath) {
        return reply.code(400).send({ error: "No uploaded Excel file found" });
    }

    try {
        let allShifts;

        // Handle single shift download
        if (type === 'single' && singleShift) {
            allShifts = [singleShift];
        } else {
            // Get all shift data for 'all' or 'month'
            const result = await getEmployeeShiftData(filePath, employeeData);

            // Flatten all shifts from all weeks
            allShifts = result.weeksData.flatMap(week => week.shifts);

            // Filter by month if requested
            if (type === 'month' && monthFilter) {
                allShifts = allShifts.filter(shift => {
                    const shiftDate = new Date(shift.date);
                    return shiftDate.getMonth() === monthFilter.month &&
                        shiftDate.getFullYear() === monthFilter.year;
                });
            }
        }

        // Use default settings if not provided
        const settings: EventSettings = eventSettings || {
            shiftReminderMinutes: 60,
            restDayReminder: false,
            restDayReminderMinutes: 540,
            eventNameFormat: 'reference',
            customPrefix: ''
        };

        // Convert shifts to ICS events with custom settings
        const events = shiftsToICSEvents(allShifts, includeRestDays, settings);

        // Generate ICS file content
        const icsContent = generateICS(events, employeeData.name);

        // Create filename
        const safeEmployeeName = employeeData.name.replace(/[^a-z0-9]/gi, '_');
        let filename = `${safeEmployeeName}_shifts`;

        if (type === 'single' && singleShift) {
            filename = `${safeEmployeeName}_${singleShift.reference || 'shift'}_${singleShift.date}`;
        } else if (type === 'month' && monthFilter) {
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            filename += `_${monthNames[monthFilter.month]}_${monthFilter.year}`;
        }

        filename += '.ics';

        // Send file
        reply
            .header('Content-Type', 'text/calendar; charset=utf-8')
            .header('Content-Disposition', `attachment; filename="${filename}"`)
            .send(icsContent);

    } catch (error: any) {
        console.error("❌ Error generating ICS:", error);
        return reply.code(500).send({ error: error.message || "Internal server error" });
    }
}