import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { uploadRoutes } from './routes/upload.routes.js';
import {employeeRoutes} from "./routes/employee.routes.js";

const server = Fastify({ logger: true });

// Register plugins
await server.register(cors, { origin: true });
await server.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Register routes
await server.register(uploadRoutes, { prefix: '/api/upload' });
await server.register(employeeRoutes, { prefix: '/api' });

const PORT = 3000;
server.listen({ port: PORT }, (err, address) => {
    if (err) {
        server.log.error(err);
        process.exit(1);
    }
    console.log(`✅ Server running on ${address}`);
});
