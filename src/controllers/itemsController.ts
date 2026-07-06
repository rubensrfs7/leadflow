import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as itemsService from '../services/itemsService.js';

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search, orderBy, order } = req.query;
  const result = await itemsService.findAll({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    search: search ? String(search) : undefined,
    orderBy: orderBy ? String(orderBy) : undefined,
    order: order ? String(order) : undefined,
  });
  res.json(result);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const data = await itemsService.findById(req.params.id);
  res.json(data);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { created_at, updated_at, ...bodyData } = req.body;
  const data = await itemsService.createOne(bodyData);
  res.status(201).json(data);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { created_at, updated_at, ...bodyData } = req.body;
  const data = await itemsService.updateOne(req.params.id, bodyData);
  res.json(data);
});

export const deleteItem = asyncHandler(async (req: Request, res: Response) => {
  await itemsService.deleteOne(req.params.id);
  res.json({ success: true, message: 'Registro deletado com sucesso!' });
});
