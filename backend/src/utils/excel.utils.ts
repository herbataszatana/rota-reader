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
    const row = rosterSheet.getRow(2);
    const cell = row.getCell(1);
    let text = '';

    if (!cell || cell.value === null) return null;

    if (typeof cell.value === 'string') {
        text = cell.value.trim();
    } else if (typeof cell.value === 'object') {
        if ('richText' in cell.value) {
            text = cell.value.richText.map(r => r.text).join('').trim();
        } else if ('text' in cell.value) {
            text = (cell.value.text as string).trim();
        } else {
            return null;
        }
    }

    // Look for pattern like "W/C 15/11/2024" or "WC 15/11/2024"
    const match = text.match(/w\/?c\s*(\d{1,2}\/\d{1,2}\/\d{4})/i);
    if (!match) return null;

    const [day, month, year] = match[1].split('/').map(Number);
    return new Date(year, month - 1, day); // Sunday = start of rota
}

export function formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}