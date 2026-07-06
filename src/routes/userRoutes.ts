import express from 'express';
import { getAll, getById, create, update, deleteItem } from '../controllers/userController.js';
import { createUserSchema, updateUserSchema } from '../validators/userValidator.js';
import { validate } from '../middleware/validate.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, getAll as any);
router.get('/:id', authenticateToken, getById as any);
router.post('/', authenticateToken, validate(createUserSchema), create as any);
router.put('/:id', authenticateToken, validate(updateUserSchema), update as any);
router.delete('/:id', authenticateToken, deleteItem as any);

export default router;
