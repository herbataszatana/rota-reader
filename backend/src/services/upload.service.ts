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
    console.log('📑 Reading Excel:', filePath);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    // Find the "Rooster" sheet
    const roosterSheet = workbook.getWorksheet('Roster');

    if (!roosterSheet) {
        throw new Error('Sheet "Rooster" not found in the workbook');
    }

    const links = parseRoosterSheet(roosterSheet);

    await fs.unlink(filePath); // remove temp file

    return {
        success: true,
        links
    };
}

function parseRoosterSheet(sheet: ExcelJS.Worksheet): Link[] {
    const links: Link[] = [];
    let currentLink: Link | null = null;
    let linkNumber = 0;
    let totalCount = 0;
    let shouldStop = false;

    console.log('📊 Total rows in sheet:', sheet.rowCount);

    sheet.eachRow((row, rowNumber) => {
        // If we should stop, just return early
        if (shouldStop) {
            return;
        }

        // Skip header rows (rows 1-7)
        if (rowNumber < 8) {
            return;
        }

        // Get raw cell values
        const wkCell = row.getCell(1);
        const nameCell = row.getCell(2);
        const totalHoursCell = row.getCell(3);

        // Extract values - handle different cell types
        let wkValue = '';
        let nameValue = '';
        let totalHoursValue = '';

        if (wkCell.value !== null && wkCell.value !== undefined) {
            if (typeof wkCell.value === 'object' && 'result' in wkCell.value) {
                wkValue = String(wkCell.value.result).trim();
            } else {
                wkValue = String(wkCell.value).trim();
            }
        }

        if (nameCell.value !== null && nameCell.value !== undefined) {
            if (typeof nameCell.value === 'object' && 'result' in nameCell.value) {
                nameValue = String(nameCell.value.result).trim();
            } else {
                nameValue = String(nameCell.value).trim();
            }
        }

        if (totalHoursCell.value !== null && totalHoursCell.value !== undefined) {
            if (typeof totalHoursCell.value === 'object' && 'result' in totalHoursCell.value) {
                totalHoursValue = String(totalHoursCell.value.result).trim();
            } else {
                totalHoursValue = String(totalHoursCell.value).trim();
            }
        }

        // Debug first few rows and around Total rows
        if (rowNumber <= 12 || rowNumber >= 48 && rowNumber <= 52) {
            console.log(`Row ${rowNumber}: wk="${wkValue}", name="${nameValue}", total="${totalHoursValue}"`);
        }

        // Check if this is a "Total:" row (marks end of a link)
        if (wkValue.toLowerCase().includes('total') || nameValue.toLowerCase().includes('total')) {
            totalCount++;
            console.log(`✅ Found Total #${totalCount} at row ${rowNumber}`);

            // Save the current link
            if (currentLink && currentLink.employees.length > 0) {
                console.log(`💾 Saving ${currentLink.link} with ${currentLink.employees.length} employees`);
                links.push(currentLink);
            }

            // Stop processing after the third total
            if (totalCount >= 3) {
                console.log('🛑 Reached 3rd total, stopping processing');
                shouldStop = true;
                return;
            }

            // Prepare for next link
            currentLink = null;
            return;
        }

        // Skip rows that don't have a valid Wk number or name
        if (!wkValue || !nameValue || wkValue.toLowerCase() === 'wk' || nameValue === '') {
            return;
        }

        // If we haven't started a link yet, initialize it
        if (!currentLink) {
            linkNumber++;
            currentLink = {
                link: `Link ${linkNumber}`,
                employees: []
            };
            console.log(`🔗 Started ${currentLink.link}`);
        }

        // Parse the employee data
        const wk = parseInt(wkValue, 10) || 0;

        currentLink.employees.push({
            name: nameValue,
            wk: wk,
        });
    });

    console.log(`📋 Final result: ${links.length} links found`);
    return links;
}