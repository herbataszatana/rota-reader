// src/controllers/employee.controller.ts
import type { FastifyRequest, FastifyReply } from "fastify";
import { getEmployeeShiftData } from "../services/employee.service.js";
import { getUploadedFilePath } from "../state/upload.state.js";
import type { EmployeeSelection } from "../types/employee.types.js";

export async function handleSelectEmployee(
    request: FastifyRequest<{ Body: EmployeeSelection }>,
    reply: FastifyReply
) {
    const { name, link, wk, startDate, endDate } = request.body;

    const filePath = getUploadedFilePath();
    if (!filePath) {
        return reply.code(400).send({ error: "No uploaded Excel file found" });
    }

    try {
        const result = await getEmployeeShiftData(filePath, request.body);
        return reply.send(result);
    } catch (error: any) {
        console.error("❌ Error:", error);
        return reply.code(500).send({ error: error.message || "Internal server error" });
    }
}
