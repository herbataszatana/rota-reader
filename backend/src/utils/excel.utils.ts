import ExcelJS from "exceljs";

export function getCellValue(cell: ExcelJS.Cell): string {
    if (!cell || cell.value == null) return '';
    if (typeof cell.value === 'string') return cell.value.trim();
    if (typeof cell.value === 'object') {
        if ('richText' in cell.value) return cell.value.richText.map(r => r.text).join('').trim();
        if ('text' in cell.value) return (cell.value.text as string).trim();
    }
    return String(cell.value).trim();
}

export function checkIfEndsNextDay(startTime: string | null, endTime: string | null) {
    if (!startTime || !endTime) return false;
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    return endHour < startHour || (endHour < 6 && startHour >= 12);
}

export function extractFirstWeekCommencing(sheet: ExcelJS.Worksheet) {
    const row = sheet.getRow(2);
    const cell = row.getCell(1);

    let text = typeof cell.value === 'string'
        ? cell.value.trim()
        : cell.value && typeof cell.value === 'object' && 'text' in cell.value
            ? (cell.value.text as string).trim()
            : '';

    const match = text.match(/w\/?c\s*(\d{1,2}\/\d{1,2}\/\d{4})/i);
    if (!match) return null;

    const [day, month, year] = match[1].split('/').map(Number);
    return new Date(year, month - 1, day);
}

export function formatDate(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
