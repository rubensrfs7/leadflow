import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getJwtSecret } from '../config/security.js';

const prisma = new PrismaClient();

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  if (
    typeof email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    email.length > 254 ||
    typeof password !== 'string' ||
    password.length < 8 ||
    password.length > 128 ||
    (name !== undefined && (typeof name !== 'string' || name.trim().length > 100))
  ) {
    return res.status(400).json({ error: 'Informe email valido e senha entre 8 e 128 caracteres.' });
  }
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return res.status(400).json({ error: 'Usuário já existe com este email.' });
  }

  const bcryptPassword = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: { email: normalizedEmail, name: typeof name === 'string' ? name.trim() : name, password: bcryptPassword }
  });

  res.status(201).json({
    message: 'Registrado com sucesso!',
    user: { id: newUser.id, email: newUser.email, name: newUser.name }
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (
    typeof email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    email.length > 254 ||
    typeof password !== 'string' ||
    password.length < 1 ||
    password.length > 128
  ) {
    return res.status(400).json({ error: 'Credenciais invalidas.' });
  }

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    getJwtSecret(),
    { expiresIn: '8h', algorithm: 'HS256' }
  );
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});
