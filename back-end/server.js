import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './src/routes/userRoutes.js';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());
app.use('/usuarios', userRoutes);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});