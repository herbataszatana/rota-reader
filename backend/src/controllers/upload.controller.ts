import { setUploadedFilePath } from "../state/upload.state.js";

import type { FastifyRequest, FastifyReply } from 'fastify';
import type { MultipartFile } from '@fastify/multipart';
import fs from 'fs/promises';
import path from 'path';
import { parseExcelFile } from '../services/upload.service.js';

export async function handleFileUpload(request: FastifyRequest, reply: FastifyReply) {
    try {
        const parts = request.parts();
        let fileFound = false;
        let filePath = '';

        const uploadDir = path.join(process.cwd(), 'tmp');
        await fs.mkdir(uploadDir, { recursive: true }); // ✅ Ensure directory exists

        for await (const part of parts) {
            if (part.type === 'file') {
                const file = part as MultipartFile;
                console.log('📂 Received file:', file.filename);

                const uploadPath = path.join(uploadDir, `${Date.now()}-${file.filename}`);
                const buffer = await file.toBuffer();

                await fs.writeFile(uploadPath, buffer);
                filePath = uploadPath;
                fileFound = true;
                setUploadedFilePath(filePath);
            }
        }

        if (!fileFound) {
            return reply.code(400).send({ error: 'No file uploaded' });
        }

        const result = await parseExcelFile(filePath);
        setUploadedFilePath(filePath);

        return reply.send({
            message: 'File processed successfully',
            result
        });

    } catch (err) {
        console.error('❌ Upload error:', err);
        reply.code(500).send({ error: 'Internal server error' });
    }
}
