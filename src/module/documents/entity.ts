import { Document as PrismaDocument } from '@prisma/client';

export class Document implements PrismaDocument {
  id: number;
  title: string;
  description: string | null;
  filePath: string;
  createdAt: Date;
  updatedAt: Date;
  createdById: number;
}