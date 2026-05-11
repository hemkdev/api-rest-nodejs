import dotenv from 'dotenv';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const userSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  idade: z.number().int().positive('Idade deve ser um número positivo'),
  email: z.string().email('Email inválido')
});

export const createUser = async (req, res) => {
  try {
    const result = userSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: 'Dados inválidos', errors: result.error.errors });
    }

    const user = await prisma.user.create({
      data: result.data
    });
    res.status(201).json(user);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Email já cadastrado!' });
    }
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};


export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getUser = async (req, res) => {
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
};

export const updateUser = async (req, res) => {
  try {
    const result = userSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: 'Dados inválidos', errors: result.error.errors });
    }

    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: result.data
    });
    res.status(200).json(user);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Usuário não encontrado!' });
    }
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const deleteUser = async (req, res) => {
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
};