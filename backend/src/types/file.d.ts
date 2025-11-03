import { MultipartFile } from '@fastify/multipart';

declare global {
    namespace Express {
        interface Request {
            file?: MultipartFile;
        }
    }
}

export {};
