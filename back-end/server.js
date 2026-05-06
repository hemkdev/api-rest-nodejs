import express from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const app = express();
const port = 3000;

app.use(express.json());

// CREATE
app.post('/usuarios', async (req, res) => {
  const { nome, idade, email } = req.body;
  const user = await prisma.user.create({
    data: { nome, idade, email }
  });
  res.json(user);
});

// READ ALL
app.get('/usuarios', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// READ ONE
app.get('/usuarios/:id', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.params.id) }
  });
  res.json(user);
});

// UPDATE
app.put('/usuarios/:id', async (req, res) => {
  const { nome, idade, email } = req.body;
  const user = await prisma.user.update({
    where: { id: Number(req.params.id) },
    data: { nome, idade, email }
  });
  res.json(user);
});

// DELETE
app.delete('/usuarios/:id', async (req, res) => {
  await prisma.user.delete({
    where: { id: Number(req.params.id) }
  });
  res.json({ message: 'Usuário deletado!' });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});