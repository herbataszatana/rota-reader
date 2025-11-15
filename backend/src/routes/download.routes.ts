// src/routes/download.routes.ts
import type { FastifyInstance } from 'fastify';
import { handleDownloadShifts } from '../controllers/download.controller.js';

export async function downloadRoutes(server: FastifyInstance) {
    server.post('/downloadShifts', handleDownloadShifts);
}