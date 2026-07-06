import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './src/swagger.js';
import { errorHandler } from './src/middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Root Endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Backend API online — Enviar leads',
    dialect: 'sqlite',
    docs: '/api/docs'
  });
});

import authRoutes from './src/routes/authRoutes.js';
app.use('/api/auth', authRoutes);

import itemsRoutes from './src/routes/itemsRoutes.js';
app.use('/api/items', itemsRoutes);

import userRoutes from './src/routes/userRoutes.js';
app.use('/api/user', userRoutes);

// API documentation Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Centralized Error Handler — must be the last middleware
app.use(errorHandler as any);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
