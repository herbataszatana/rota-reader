import ExcelJS from 'exceljs';
import fs from 'fs/promises';

interface Employee {
    name: string;
    wk: number;
}

interface Link {
    link: string;
    employees: Employee[];
}

export async function parseExcelFile(filePath: string) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    // Find the "Rooster" sheet
    const roosterSheet = workbook.getWorksheet('Roster');

    if (!roosterSheet) {
        throw new Error('Sheet "Rooster" not found in the workbook');
    }

    const links = parseRoosterSheet(roosterSheet);

    // ❌ Do NOT delete the file yet — we need it later
    // await fs.unlink(filePath);

    return {
        success: true,
        links,
        filePath // ✅ return it so we always know where it is
    };
}

function parseRoosterSheet(sheet: ExcelJS.Worksheet): Link[] {
    const links: Link[] = [];
    let currentLink: Link | null = null;
    let linkNumber = 0;
    let totalCount = 0;
    let shouldStop = false;

    sheet.eachRow((row, rowNumber) => {
        if (shouldStop) return;

        // Skip header rows (1–7)
        if (rowNumber < 8) return;

        const wkCell = row.getCell(1);
        const nameCell = row.getCell(2);
        const totalHoursCell = row.getCell(3);

        let wkValue = '';
        let nameValue = '';
        let totalHoursValue = '';

        if (wkCell.value != null) {
            wkValue = typeof wkCell.value === 'object' && 'result' in wkCell.value
                ? String(wkCell.value.result).trim()
                : String(wkCell.value).trim();
        }

        if (nameCell.value != null) {
            nameValue = typeof nameCell.value === 'object' && 'result' in nameCell.value
                ? String(nameCell.value.result).trim()
                : String(nameCell.value).trim();
        }

        if (totalHoursCell.value != null) {
            totalHoursValue = typeof totalHoursCell.value === 'object' && 'result' in totalHoursCell.value
                ? String(totalHoursCell.value.result).trim()
                : String(totalHoursCell.value).trim();
        }

        // Check if this is a TOTAL row
        if (wkValue.toLowerCase().includes('total') || nameValue.toLowerCase().includes('total')) {
            totalCount++;

            if (currentLink && currentLink.employees.length > 0) {
                links.push(currentLink);
            }

            if (totalCount >= 3) {
                shouldStop = true;
                return;
            }

            currentLink = null;
            return;
        }

        if (!wkValue || !nameValue || wkValue.toLowerCase() === 'wk' || nameValue === '') return;

        if (!currentLink) {
            linkNumber++;
            currentLink = { link: `Link ${linkNumber}`, employees: [] };
        }

        const wk = parseInt(wkValue, 10) || 0;

        currentLink.employees.push({
            name: nameValue,
            wk
        });
    });

    return links;
}