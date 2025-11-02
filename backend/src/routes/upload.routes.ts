import type {FastifyInstance} from 'fastify';
import { handleFileUpload } from '../controllers/upload.controller.js';

export async function uploadRoutes(server: FastifyInstance) {
    server.post('/', handleFileUpload);
}
