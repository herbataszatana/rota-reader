import type { FastifyRequest, FastifyReply } from 'fastify';
import ExcelJS from 'exceljs';
import { getUploadedFilePath } from "../state/upload.state.js";

interface EmployeeSelection {
    name: string;
    link: string;
    wk: number;
    startDate?: string; // optional YYYY-MM-DD
    endDate?: string;   // optional YYYY-MM-DD
}

interface Shift {
    weekNumber: number;
    day: string;
    date: string; // YYYY-MM-DD
    startTime: string | null;
    endTime: string | null;
    startDateTime: string | null;
    endDateTime: string | null;
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

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKS_TO_COLLECT = 26;

export async function handleSelectEmployee(
    request: FastifyRequest<{ Body: EmployeeSelection }>,
    reply: FastifyReply
) {
    const { name, link, wk, startDate, endDate } = request.body;
    console.log("📩 Employee selected:", request.body);

    const filePath = getUploadedFilePath();
    if (!filePath) return reply.code(400).send({ error: "No uploaded Excel file found" });

    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);

        // Find the correct link sheet
        const sheet = workbook.worksheets.find(s =>
            s.name.toLowerCase().includes(link.toLowerCase())
        );
        if (!sheet) return reply.code(400).send({
            error: `No sheet matching "${link}" found`,
            receivedLink: link,
            availableSheets: workbook.worksheets.map(s => s.name)
        });

        console.log("✅ Matched sheet:", sheet.name);

        // Get roster start date from "Roster" sheet
        const rosterSheet = workbook.getWorksheet('Roster');
        const wcDate = rosterSheet ? extractFirstWeekCommencing(rosterSheet) : null;
        if (!wcDate) return reply.code(400).send({ error: "Could not find first week commencing date" });
        const firstWeekDate = new Date(wcDate);

        // Parse all valid week rows from sheet
        const weekRows: { row: ExcelJS.Row; weekNumber: number }[] = [];
        for (let i = 1; i <= sheet.rowCount; i++) {
            const row = sheet.getRow(i);
            const val = getCellValue(row.getCell(1));
            if (!val) continue;
            const weekNumber = parseInt(val);
            if (!isNaN(weekNumber)) weekRows.push({ row, weekNumber });
        }

        if (weekRows.length === 0) return reply.code(400).send({ error: "No valid week rows found" });

        // Find starting index for selected employee's week
        let startIndex = weekRows.findIndex(r => r.weekNumber === wk);
        if (startIndex === -1) startIndex = 0;

        // Convert date filters
        const startFilter = startDate ? new Date(startDate) : null;
        const endFilter = endDate ? new Date(endDate) : null;

        const shiftsData: WeekData[] = [];

        for (let i = 0; i < WEEKS_TO_COLLECT; i++) {
            const index = (startIndex + i) % weekRows.length;
            const { row, weekNumber } = weekRows[index];
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
                shiftDate.setDate(firstWeekDate.getDate() + (i * 7) + dayIndex);

                // Skip shift if outside date filter
                if ((startFilter && shiftDate < startFilter) || (endFilter && shiftDate > endFilter)) continue;

                let startDateTime: string | null = null;
                let endDateTime: string | null = null;
                if (!isRestDay && onTime && offTime) {
                    startDateTime = `${formatDate(shiftDate)}T${onTime}:00`;
                    if (endsNextDay) {
                        const endDateObj = new Date(shiftDate);
                        endDateObj.setDate(shiftDate.getDate() + 1);
                        endDateTime = `${formatDate(endDateObj)}T${offTime}:00`;
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

            // Skip empty weeks due to date filter
            if (shifts.length === 0) continue;

            const weekCommencing = new Date(firstWeekDate);
            weekCommencing.setDate(firstWeekDate.getDate() + (i * 7));

            shiftsData.push({
                weekNumber,
                weekCommencing: formatDate(weekCommencing),
                totalHours,
                shifts
            });
        }

        return reply.send({
            success: true,
            message: `Retrieved ${shiftsData.length} weeks of shifts for ${name}`,
            selectedEmployee: { name, link, wk, startDate, endDate },
            currentWeek: wk,
            weeksData: shiftsData
        });

    } catch (err) {
        console.error("❌ Error reading Excel file:", err);
        return reply.code(500).send({ error: "Internal server error" });
    }
}

// ---------------- HELPERS ---------------- //

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

function extractFirstWeekCommencing(rosterSheet: ExcelJS.Worksheet): Date | null {
    const row = rosterSheet.getRow(2);
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
    return new Date(year, month - 1, day); // Sunday = start of rota
}

function formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export { checkIfEndsNextDay, extractFirstWeekCommencing, formatDate };
