import type {FastifyRequest, FastifyReply} from 'fastify';
import type { MultipartFile } from '@fastify/multipart';
import fs from 'fs/promises';

export async function handleFileUpload(request: FastifyRequest, reply: FastifyReply) {
    const parts = request.parts();

    for await (const part of parts) {
        if (part.type === 'file') {
            const file = part as MultipartFile;

            console.log('📂 Received file:', file.filename);

            // You could temporarily buffer it or just discard
            // await fs.writeFile(`/tmp/${file.filename}`, await file.toBuffer());

            return reply.send({ message: `File received: ${file.filename}` });
        }
    }

    reply.code(400).send({ error: 'No file uploaded' });
}
