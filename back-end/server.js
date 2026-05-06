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
  try {
    const { nome, idade, email } = req.body;
    const user = await prisma.user.create({
      data: { nome, idade, email }
    });
    res.status(201).json(user);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Email já cadastrado!' });
    }
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});


// READ ALL
app.get('/usuarios', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// READ ONE
app.get('/usuarios/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.params.id) }
    });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// UPDATE
app.put('/usuarios/:id', async (req, res) => {
  try {
    const { nome, idade, email } = req.body;
    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { nome, idade, email }
    });
    res.status(200).json(user);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Usuário não encontrado!' });
    }
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// DELETE
app.delete('/usuarios/:id', async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: Number(req.params.id) }
    });
    res.status(200).json({ message: 'Usuário deletado!' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Usuário não encontrado!' });
    }
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});