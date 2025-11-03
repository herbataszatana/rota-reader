// src/controllers/upload.controller.ts
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { MultipartFile } from '@fastify/multipart';

export async function handleFileUpload(request: FastifyRequest, reply: FastifyReply) {
    try {
        const parts = request.parts();
        let fileFound = false;

        for await (const part of parts) {
            if (part.type === 'file') {
                const file = part as MultipartFile;
                console.log('📂 Received file:', file.filename);

                // (Optional) Save file to /tmp
                // import fs from 'fs/promises';
                // await fs.writeFile(`/tmp/${file.filename}`, await file.toBuffer());

                fileFound = true;
            }
        }

        if (fileFound) {
            return reply.send({ message: 'File uploaded successfully' });
        }

        reply.code(400).send({ error: 'No file uploaded' });
    } catch (err) {
        console.error('❌ Upload error:', err);
        reply.code(500).send({ error: 'Internal server error' });
    }
}
