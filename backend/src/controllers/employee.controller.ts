import type { FastifyRequest, FastifyReply } from 'fastify';
import ExcelJS from 'exceljs';
import { getUploadedFilePath } from "../state/upload.state.js";

interface EmployeeSelection {
    name: string;
    link: string;
    wk: number;
}

interface Shift {
    weekNumber: number;
    day: string;
    date: string; // ISO date: YYYY-MM-DD
    startTime: string | null; // HH:MM format
    endTime: string | null; // HH:MM format
    startDateTime: string | null; // Full ISO datetime
    endDateTime: string | null;   // Full ISO datetime
    reference: string | null;
    totalHours: string | null;
    isRestDay: boolean;
    endsNextDay: boolean;
}

interface WeekData {
    weekNumber: number;
    weekCommencing: string;
    totalHours: string;
    shifts: Shift[];
}

// Sunday-first week
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TOTAL_WEEKS = 42;

export async function handleSelectEmployee(
    request: FastifyRequest<{ Body: EmployeeSelection }>,
    reply: FastifyReply
) {
    const { name, link, wk } = request.body;

    console.log("📩 Employee selected:", request.body);

    const filePath = getUploadedFilePath();
    if (!filePath) {
        return reply.code(400).send({ error: "No uploaded Excel file found. Upload first." });
    }

    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);

        console.log("📄 Available sheets:", workbook.worksheets.map(s => s.name));

        const sheet = workbook.worksheets.find(s =>
            s.name.toLowerCase().includes(link.toLowerCase())
        );

        if (!sheet) {
            return reply.code(400).send({
                error: `No sheet matching "${link}" found`,
                receivedLink: link,
                availableSheets: workbook.worksheets.map(s => s.name)
            });
        }

        console.log("✅ Matched sheet:", sheet.name);

        const roosterSheet = workbook.getWorksheet('Rooster');
        const wcDate = roosterSheet ? extractFirstWeekCommencing(roosterSheet) : null;

        if (!wcDate) {
            return reply.code(400).send({ error: "Could not find the first week commencing date in Rooster sheet" });
        }

        const firstWeekDate = new Date(wcDate); // WC = Sunday
        console.log("📅 First week (Sunday):", formatDate(firstWeekDate));

        const shiftsData = parseShifts(sheet, wk, firstWeekDate);

        // Log first week to console
        if (shiftsData.length > 0) {
            console.log("📅 First week data:", JSON.stringify(shiftsData[0], null, 2));
        }

        return reply.send({
            success: true,
            message: `Retrieved ${shiftsData.length} weeks of shifts for ${name}`,
            selectedEmployee: { name, link, wk },
            currentWeek: wk,
            weeksData: shiftsData
        });

    } catch (err) {
        console.error("❌ Error reading Excel file:", err);
        return reply.code(500).send({ error: "Internal server error" });
    }
}

// ------------------ HELPERS ------------------ //

function parseShifts(sheet: ExcelJS.Worksheet, startWeek: number, firstWeekDate: Date): WeekData[] {
    const weeksData: WeekData[] = [];
    const weeksToCollect = 26;

    let currentWeek = startWeek;
    let weeksCollected = 0;

    while (weeksCollected < weeksToCollect) {
        const rowIndex = currentWeek + 2; // adjust for Excel layout
        const row = sheet.getRow(rowIndex);

        if (!row || !row.getCell(1).value) {
            if (currentWeek > 1) {
                currentWeek = 1;
                continue;
            } else {
                break;
            }
        }

        const weekNumber = parseInt(getCellValue(row.getCell(1))) || currentWeek;
        const totalHours = getCellValue(row.getCell(2));

        const shifts: Shift[] = [];

        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            const baseCol = 3 + (dayIndex * 4);
            const onTime = getCellValue(row.getCell(baseCol));
            const offTime = getCellValue(row.getCell(baseCol + 1));
            const turn = getCellValue(row.getCell(baseCol + 2));
            const dayTotal = getCellValue(row.getCell(baseCol + 3));

            const isRestDay = turn === 'RD' || (!onTime && !offTime && !turn);
            const endsNextDay = checkIfEndsNextDay(onTime, offTime);

            const shiftDate = new Date(firstWeekDate);
            shiftDate.setDate(firstWeekDate.getDate() + ((currentWeek - 1) * 7) + dayIndex);

            let startDateTime: string | null = null;
            let endDateTime: string | null = null;

            if (!isRestDay && onTime && offTime) {
                startDateTime = `${formatDate(shiftDate)}T${onTime}:00`;
                if (endsNextDay) {
                    const endDate = new Date(shiftDate);
                    endDate.setDate(shiftDate.getDate() + 1);
                    endDateTime = `${formatDate(endDate)}T${offTime}:00`;
                } else {
                    endDateTime = `${formatDate(shiftDate)}T${offTime}:00`;
                }
            }

            shifts.push({
                weekNumber,
                day: DAYS[dayIndex],
                date: formatDate(shiftDate),
                startTime: isRestDay ? null : onTime,
                endTime: isRestDay ? null : offTime,
                startDateTime,
                endDateTime,
                reference: isRestDay ? null : turn,
                totalHours: isRestDay ? null : dayTotal,
                isRestDay,
                endsNextDay
            });
        }

        const weekCommencing = new Date(firstWeekDate);
        weekCommencing.setDate(firstWeekDate.getDate() + ((currentWeek - 1) * 7));

        weeksData.push({
            weekNumber,
            weekCommencing: formatDate(weekCommencing),
            totalHours,
            shifts
        });

        weeksCollected++;
        currentWeek++;
        if (currentWeek > TOTAL_WEEKS) currentWeek = 1;
    }

    return weeksData;
}

function getCellValue(cell: ExcelJS.Cell): string {
    if (!cell || cell.value === null || cell.value === undefined) return '';

    if (typeof cell.value === 'string') return cell.value.trim();
    if (typeof cell.value === 'object') {
        if ('richText' in cell.value) return cell.value.richText.map(r => r.text).join('').trim();
        if ('text' in cell.value) return (cell.value.text as string).trim();
    }

    return String(cell.value).trim();
}

function checkIfEndsNextDay(startTime: string | null, endTime: string | null): boolean {
    if (!startTime || !endTime) return false;

    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);

    return endHour < startHour || (endHour >= 0 && endHour < 6 && startHour >= 12);
}

function extractFirstWeekCommencing(roosterSheet: ExcelJS.Worksheet): Date | null {
    const row = roosterSheet.getRow(2);
    const cell = row.getCell(1);
    let text = '';

    if (!cell || cell.value === null) return null;

    if (typeof cell.value === 'string') text = cell.value.trim();
    else if (typeof cell.value === 'object') {
        if ('richText' in cell.value) text = cell.value.richText.map(r => r.text).join('').trim();
        else if ('text' in cell.value) text = (cell.value.text as string).trim();
        else return null;
    }

    const match = text.match(/w\/?c\s*(\d{1,2}\/\d{1,2}\/\d{4})/i);
    if (!match) return null;

    const [day, month, year] = match[1].split('/').map(Number);
    return new Date(year, month - 1, day); // Sunday = first day of rota
}

function formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// Export helpers for testing
export { parseShifts, checkIfEndsNextDay, extractFirstWeekCommencing, formatDate };
