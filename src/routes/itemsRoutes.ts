import express from 'express';
import { getAll, getById, create, update, deleteItem } from '../controllers/itemsController.js';
import { createItemsSchema, updateItemsSchema } from '../validators/itemsValidator.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.get('/', getAll as any);
router.get('/:id', getById as any);
router.post('/', validate(createItemsSchema), create as any);
router.put('/:id', validate(updateItemsSchema), update as any);
router.delete('/:id', deleteItem as any);

export default router;
