import * as itemsRepository from '../repositories/itemsRepository.js';

export async function findAll({ page = 1, limit = 20, search = '', orderBy = 'created_at', order = 'desc' }: { page?: number; limit?: number; search?: string; orderBy?: string; order?: string } = {}) {
  const pageNum = Math.max(1, parseInt(String(page)));
  const limitNum = Math.min(100, Math.max(1, parseInt(String(limit))));
  const skip = (pageNum - 1) * limitNum;

  const where = itemsRepository.buildSearchWhere(search);

  const { data, total } = await itemsRepository.findMany({
    skip,
    take: limitNum,
    where,
    orderBy: { [orderBy]: order }
  });

  return {
    data,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    }
  };
}

export async function findById(id: string | number) {
  const data = await itemsRepository.findById(id);
  if (!data) {
    const err = new Error('Registro nao encontrado.') as any;
    err.statusCode = 404;
    throw err;
  }
  return data;
}

export async function createOne(bodyData: any) {
  return itemsRepository.create(bodyData);
}

export async function updateOne(id: string | number, bodyData: any) {
  await findById(id);
  return itemsRepository.update(id, bodyData);
}

export async function deleteOne(id: string | number) {
  await findById(id);
  return itemsRepository.remove(id);
}
