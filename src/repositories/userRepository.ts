import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function findMany({ skip = 0, take = 20, where = {}, orderBy = { created_at: 'desc' } }: { skip?: number; take?: number; where?: any; orderBy?: any } = {}) {
  const [data, total] = await Promise.all([
    (prisma as any).user.findMany({ where, skip, take, orderBy, include: {} }),
    (prisma as any).user.count({ where })
  ]);
  return { data, total };
}

export async function findById(id: string | number) {
  const parsedId = isNaN(Number(id)) ? id : Number(id);
  return (prisma as any).user.findUnique({
    where: { id: parsedId as any },
    include: {}
  });
}

export async function create(data: any) {
  return (prisma as any).user.create({ data });
}

export async function update(id: string | number, data: any) {
  const parsedId = isNaN(Number(id)) ? id : Number(id);
  return (prisma as any).user.update({ where: { id: parsedId as any }, data });
}

export async function remove(id: string | number) {
  const parsedId = isNaN(Number(id)) ? id : Number(id);
  return (prisma as any).user.delete({ where: { id: parsedId as any } });
}

export function buildSearchWhere(search?: string) {
  return search ? { OR: [{ name: { contains: search } }, { email: { contains: search } }, { password: { contains: search } }] } : {};
}
