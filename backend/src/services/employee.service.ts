// src/services/employee.service.ts
import ExcelJS from "exceljs";
import {
    extractFirstWeekCommencing,
    checkIfEndsNextDay,
    formatDate,
    getCellValue
} from "../utils/excel.utils.js";

import { EmployeeSelection } from "../types/employee.types.js";
import { Shift, WeekData } from "../types/shift.js";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DEFAULT_WEEKS = 26;
const MAX_WEEKS = 52;

export async function getEmployeeShiftData(filePath: string, body: EmployeeSelection) {
    const { name, link, wk, startDate, endDate } = body;

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheet = workbook.worksheets.find(s =>
        s.name.toLowerCase().includes(link.toLowerCase())
    );

    if (!sheet) {
        throw new Error(`No sheet matching "${link}" found`);
    }

    const rosterSheet = workbook.getWorksheet("Roster");
    if (!rosterSheet) {
        throw new Error("Roster sheet not found in workbook");
    }

    const rosterStartDateRaw = extractFirstWeekCommencing(rosterSheet);
    if (!rosterStartDateRaw) {
        throw new Error("Could not find first week commencing date in Roster sheet");
    }

    const rosterStartDate = new Date(rosterStartDateRaw);
    console.log("✅ Roster start date:", formatDate(rosterStartDate));

    const weekRows: { row: ExcelJS.Row; weekNumber: number }[] = [];

    for (let i = 1; i <= sheet.rowCount; i++) {
        const row = sheet.getRow(i);
        const val = getCellValue(row.getCell(1));
        const weekNumber = parseInt(val);
        if (!isNaN(weekNumber)) weekRows.push({ row, weekNumber });
    }

    if (weekRows.length === 0) throw new Error("No valid week rows found");

    let startIndex = weekRows.findIndex(r => r.weekNumber === wk);
    if (startIndex === -1) startIndex = 0;

    const startFilter = startDate ? new Date(startDate) : rosterStartDate;
    const endFilter = endDate ? new Date(endDate) : null;

    if (endFilter && endFilter < rosterStartDate) {
        throw new Error("Selected dates fall before the roster weeks start");
    }

    let weeksToCollect = DEFAULT_WEEKS;
    let warningMessage: string | null = null;

    if (endFilter) {
        const diffInMs = endFilter.getTime() - rosterStartDate.getTime();
        const diffInWeeks = Math.ceil(diffInMs / (1000 * 60 * 60 * 24 * 7));
        weeksToCollect = Math.max(diffInWeeks + 1, DEFAULT_WEEKS);

        if (weeksToCollect > MAX_WEEKS) {
            weeksToCollect = MAX_WEEKS;
            const lastAllowedDate = new Date(rosterStartDate);
            lastAllowedDate.setDate(rosterStartDate.getDate() + (MAX_WEEKS * 7) - 1);
            warningMessage = `Only ${MAX_WEEKS} weeks allowed. Displaying until ${formatDate(lastAllowedDate)}`;
        }
    }

    const shiftsData: WeekData[] = [];

    for (let i = 0; i < weeksToCollect; i++) {
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

            const isRestDay = turn === "RD" || (!onTime && !offTime && !turn);
            const endsNextDay = checkIfEndsNextDay(onTime, offTime);
            const shiftDate = new Date(rosterStartDate);
            shiftDate.setDate(rosterStartDate.getDate() + (i * 7) + dayIndex);

            if (shiftDate < startFilter || (endFilter && shiftDate > endFilter)) continue;

            let startDateTime: string | null = null;
            let endDateTime: string | null = null;

            if (!isRestDay && onTime && offTime) {
                startDateTime = `${formatDate(shiftDate)}T${onTime}:00`;
                const endDateObj = new Date(shiftDate);
                if (endsNextDay) endDateObj.setDate(shiftDate.getDate() + 1);
                endDateTime = `${formatDate(endDateObj)}T${offTime}:00`;
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

        if (!shifts.length) continue;

        const weekCommencing = new Date(rosterStartDate);
        weekCommencing.setDate(rosterStartDate.getDate() + (i * 7));

        shiftsData.push({
            weekNumber,
            weekCommencing: formatDate(weekCommencing),
            totalHours,
            shifts
        });
    }

    return {
        success: true,
        message: `Retrieved ${shiftsData.length} weeks of shifts for ${name}`,
        selectedEmployee: body,
        currentWeek: wk,
        weeksData: shiftsData,
        ...(warningMessage && { warning: warningMessage })
    };
}