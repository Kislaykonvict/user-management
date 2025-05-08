import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/prisma/prisma.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';
import { Document } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { File } from 'multer';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  private readonly uploadDir = 'uploads/documents';

  

async create(
  createDocumentDto: CreateDocumentDto,
  file: File,
  userId: number
): Promise<Document> {
  if (!fs.existsSync(this.uploadDir)) {
    fs.mkdirSync(this.uploadDir, { recursive: true });
  }

  const fileExtension = path.extname(file.originalname);
  const fileName = `${uuidv4()}${fileExtension}`;
  const filePath = path.join(this.uploadDir, fileName);

  fs.writeFileSync(filePath, file.buffer);

  return this.prisma.document.create({
    data: {
      title: createDocumentDto.title,
      description: createDocumentDto.description,
      filePath,
      createdBy: { connect: { id: userId } },
    },
  });
}

  async findAll(userId: number, role: string): Promise<Document[]> {
    // Admins can see all documents, others can only see their own
    if (role === 'ADMIN') {
      return this.prisma.document.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }
    
    return this.prisma.document.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: number, role: string): Promise<Document> {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    // Check if user has access to this document
    if (role !== 'ADMIN' && document.createdById !== userId) {
      throw new UnauthorizedException('You do not have permission to access this document');
    }

    return document;
  }

  async update(
    id: number,
    updateDocumentDto: UpdateDocumentDto,
    userId: number,
    role: string,
  ): Promise<Document> {
    // Check if document exists and if user has access
    const document = await this.findOne(id, userId, role);
    
    // Only document creator or admin can update
    if (role !== 'ADMIN' && document.createdById !== userId) {
      throw new UnauthorizedException('You do not have permission to update this document');
    }
    
    return this.prisma.document.update({
      where: { id },
      data: updateDocumentDto,
    });
  }

  async remove(id: number, userId: number, role: string): Promise<Document> {
    // Check if document exists and if user has access
    const document = await this.findOne(id, userId, role);
    
    // Only document creator or admin can delete
    if (role !== 'ADMIN' && document.createdById !== userId) {
      throw new UnauthorizedException('You do not have permission to delete this document');
    }
    
    try {
      // Delete file from storage
      if (fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
      }
      
      // Delete document from database
      return this.prisma.document.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException('Error deleting document: ' + error.message);
    }
  }

  async getDocumentFile(id: number, userId: number, role: string): Promise<{ path: string; filename: string }> {
    const document = await this.findOne(id, userId, role);
    
    if (!fs.existsSync(document.filePath)) {
      throw new NotFoundException('Document file not found on server');
    }
    
    return { 
      path: document.filePath, 
      filename: path.basename(document.filePath)
    };
  }
}