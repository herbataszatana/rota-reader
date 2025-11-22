// src/utils/excel.utils.ts
import ExcelJS from "exceljs";

export function getCellValue(cell: ExcelJS.Cell): string {
    if (!cell || cell.value === null || cell.value === undefined) return '';
    if (typeof cell.value === 'string') return cell.value.trim();
    if (typeof cell.value === 'object') {
        if ('richText' in cell.value) return cell.value.richText.map(r => r.text).join('').trim();
        if ('text' in cell.value) return (cell.value.text as string).trim();
    }
    return String(cell.value).trim();
}

export function checkIfEndsNextDay(startTime: string | null, endTime: string | null): boolean {
    if (!startTime || !endTime) return false;
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    return endHour < startHour || (endHour >= 0 && endHour < 6 && startHour >= 12);
}

export function extractFirstWeekCommencing(rosterSheet: ExcelJS.Worksheet): Date | null {
    const row = rosterSheet.getRow(4);
    const cell = row.getCell('AA'); // Column AA (you can also use getCell(27) as AA is the 27th column)
    let text = '';

    if (!cell || cell.value === null) return null;

    // Handle different cell value types
    if (typeof cell.value === 'string') {
        text = cell.value.trim();
    } else if (cell.value instanceof Date) {
        // If it's already a Date object, return it directly
        return cell.value;
    } else if (typeof cell.value === 'number') {
        // Excel stores dates as serial numbers - ExcelJS converts them automatically
        // This handles the case where it might be a numeric serial date
        const excelEpoch = new Date(1899, 11, 30); // Excel epoch
        const daysOffset = cell.value as number;
        const date = new Date(excelEpoch.getTime() + daysOffset * 24 * 60 * 60 * 1000);
        return date;
    } else if (typeof cell.value === 'object') {
        if ('richText' in cell.value) {
            text = cell.value.richText.map(r => r.text).join('').trim();
        } else if ('text' in cell.value) {
            text = (cell.value.text as string).trim();
        } else if ('result' in cell.value) {
            text = String(cell.value.result).trim();
        } else {
            return null;
        }
    }

    // If we got a text string, try to parse it as dd/mm/yyyy format
    if (text) {
        const match = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (!match) return null;

        const [, day, month, year] = match;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    return null;
}
export function formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}