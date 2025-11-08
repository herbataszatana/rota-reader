// src/routes/employee.routes.ts
import type { FastifyInstance } from 'fastify';
import { handleSelectEmployee } from '../controllers/employee.controller.js';

export async function employeeRoutes(server: FastifyInstance) {
    server.post('/selectEmployee', handleSelectEmployee);
}
