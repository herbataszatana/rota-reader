// src/services/upload.service.ts
import ExcelJS from "exceljs";
import fs from "fs/promises";
import { Employee, Link } from "../types/employee.types.js";

export async function parseExcelFile(filePath: string) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const roosterSheet = workbook.getWorksheet("Roster");
    if (!roosterSheet) {
        throw new Error('Sheet "Roster" not found in the workbook');
    }

    const links = parseRoosterSheet(roosterSheet);

    return {
        success: true,
        links,
        filePath
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

        if (rowNumber < 8) return;

        const wkCell = row.getCell(1);
        const nameCell = row.getCell(2);

        let wkValue = "";
        let nameValue = "";

        if (wkCell.value != null) {
            wkValue = typeof wkCell.value === "object" && "result" in wkCell.value
                ? String(wkCell.value.result).trim()
                : String(wkCell.value).trim();
        }

        if (nameCell.value != null) {
            nameValue = typeof nameCell.value === "object" && "result" in nameCell.value
                ? String(nameCell.value.result).trim()
                : String(nameCell.value).trim();
        }

        if (wkValue.toLowerCase().includes("total") || nameValue.toLowerCase().includes("total")) {
            totalCount++;
            if (currentLink && currentLink.employees.length > 0) links.push(currentLink);
            if (totalCount >= 3) shouldStop = true;
            currentLink = null;
            return;
        }

        if (!wkValue || !nameValue || wkValue.toLowerCase() === "wk" || nameValue === "") return;

        if (!currentLink) {
            linkNumber++;
            currentLink = { link: `Link ${linkNumber}`, employees: [] };
        }

        const wk = parseInt(wkValue, 10) || 0;
        currentLink.employees.push({ name: nameValue, wk });
    });

    return links;
}
