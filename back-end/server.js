import 'dotenv/config';
import { prisma } from './src/controllers/userController.js';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './src/swagger.js';
import userRoutes from './src/routes/userRoutes.js';

const app = express();
const port = 3000;

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/usuarios', userRoutes);

const server = app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log(`Documentação em http://localhost:${port}/api-docs`);
});

process.on('SIGTERM', async () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});
