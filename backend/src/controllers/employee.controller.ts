import type { FastifyRequest, FastifyReply } from 'fastify';
import ExcelJS from 'exceljs';
import { getUploadedFilePath } from "../state/upload.state.js";

interface EmployeeSelection {
    name: string;
    link: string;
    wk: number;
}

export async function handleSelectEmployee(
    request: FastifyRequest<{ Body: EmployeeSelection }>,
    reply: FastifyReply
) {
    const { name, link, wk } = request.body;

    console.log("📩 Employee selected:", request.body);

    // Get the last uploaded Excel file
    const filePath = getUploadedFilePath();
    if (!filePath) {
        return reply.code(400).send({ error: "No uploaded Excel file found. Upload first." });
    }

    try {
        // Load workbook
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);

        // Log all sheet names for debugging
        console.log("📄 Available sheets:", workbook.worksheets.map(s => s.name));

        // Fuzzy match: find any sheet containing the link string
        const sheet = workbook.worksheets.find(s =>
            s.name.toLowerCase().includes(link.toLowerCase())
        );

        if (!sheet) {
            console.log("❌ No sheet matched for link:", link);
            return reply.code(400).send({
                error: `No sheet matching "${link}" found in workbook`,
                receivedLink: link,
                availableSheets: workbook.worksheets.map(s => s.name)
            });
        }

        console.log("✅ Matched sheet:", sheet.name);

        // Return only the selected employee
        return reply.send({
            success: true,
            message: `Employee selected successfully`,
            selectedEmployee: { name, link, wk }
        });

    } catch (err) {
        console.error("❌ Error reading Excel file:", err);
        return reply.code(500).send({ error: "Internal server error" });
    }
}
