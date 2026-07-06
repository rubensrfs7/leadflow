import { z } from 'zod';

// Schema de validacao para criacao de user
export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().min(1),
  password: z.string().min(1)
});

// Schema para atualizacao - todos os campos tornam-se opcionais
export const updateUserSchema = createUserSchema.partial();
