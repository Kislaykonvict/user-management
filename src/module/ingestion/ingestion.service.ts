import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/prisma/prisma.service';
import { CreateIngestionJobDto, UpdateIngestionJobDto } from './dto/ingestion.dto'; 
import { IngestionJob } from '@prisma/client';
import { Status } from '@prisma/client';

@Injectable()
export class IngestionService {
  constructor(
    private prisma: PrismaService,
) {}

  async create(createIngestionJobDto: CreateIngestionJobDto, userId: number): Promise<IngestionJob> {
    // Check if document exists
    const document = await this.prisma.document.findUnique({
      where: { id: createIngestionJobDto.documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${createIngestionJobDto.documentId} not found`);
    }

    // Check if user has access to the document
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.role !== 'ADMIN' && document.createdById !== userId) {
      throw new UnauthorizedException('You do not have permission to create an ingestion job for this document');
    }

    // Create the ingestion job
    const job = await this.prisma.ingestionJob.create({
      data: {
        document: { connect: { id: createIngestionJobDto.documentId } },
        startedBy: { connect: { id: userId } },
        status: Status.PENDING,
      },
    });

    // In a real-world scenario, we would kick off an async job here
    // For demo purposes, let's simulate starting the job
    this.processJob(job.id);

    return job;
  }


  private async processJob(jobId: number): Promise<void> {
    // Update status to PROCESSING
    await this.prisma.ingestionJob.update({
      where: { id: jobId },
      data: { status: Status.PROCESSING },
    });

    // Simulate processing time
    setTimeout(async () => {
      try {
        // Get the job details to process
        const job = await this.prisma.ingestionJob.findUnique({
          where: { id: jobId },
          include: { document: true },
        });

        if (!job) return;

        // Simulate success most of the time, occasional failure
        const success = Math.random() > 0.2;
        
        // Update the job with results
        await this.prisma.ingestionJob.update({
          where: { id: jobId },
          data: {
            status: success ? Status.COMPLETED : Status.FAILED,
            completedAt: new Date(),
            output: success 
              ? `Successfully processed ${job.document.title}. Extracted content and metadata.` 
              : `Failed to process document. Error: Could not parse file format.`,
          },
        });
      } catch (error) {
        // Handle any errors in the background process
        await this.prisma.ingestionJob.update({
          where: { id: jobId },
          data: {
            status: Status.FAILED,
            completedAt: new Date(),
            output: `Error processing job: ${error.message}`,
          },
        });
      }
    }, 5000); // 5 second delay to simulate processing
  }

  async findAll(userId: number, role: string): Promise<IngestionJob[]> {
    // Admins can see all ingestion jobs, others can only see their own
    if (role === 'ADMIN') {
      return this.prisma.ingestionJob.findMany({
        orderBy: { startedAt: 'desc' },
      });
    }
    
    return this.prisma.ingestionJob.findMany({
      where: { startedById: userId },
      orderBy: { startedAt: 'desc' },
    });
  }

  async findOne(id: number, userId: number, role: string): Promise<IngestionJob> {
    const job = await this.prisma.ingestionJob.findUnique({
      where: { id },
      include: { document: true },
    });

    if (!job) {
      throw new NotFoundException(`Ingestion job with ID ${id} not found`);
    }

    // Check if user has access
    if (role !== 'ADMIN' && job.startedById !== userId) {
      throw new UnauthorizedException('You do not have permission to access this ingestion job');
    }

    return job;
  }

  async update(
    id: number,
    updateIngestionJobDto: UpdateIngestionJobDto,
    userId: number,
    role: string,
  ): Promise<IngestionJob> {
    // Only admins can update ingestion jobs
    if (role !== 'ADMIN') {
      throw new UnauthorizedException('Only administrators can update ingestion jobs');
    }

    // Check if job exists
    const job = await this.prisma.ingestionJob.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Ingestion job with ID ${id} not found`);
    }

    // Update the job
    return this.prisma.ingestionJob.update({
      where: { id },
      data: updateIngestionJobDto,
    });
  }

  async cancel(id: number, userId: number, role: string): Promise<IngestionJob> {
    const job = await this.findOne(id, userId, role);
    
    // Only the user who started the job or admins can cancel it
    if (role !== 'ADMIN' && job.startedById !== userId) {
      throw new UnauthorizedException('You do not have permission to cancel this ingestion job');
    }
    
    // Can only cancel jobs that are in PENDING or PROCESSING status
    if (job.status !== Status.PENDING && job.status !== Status.PROCESSING) {
      throw new BadRequestException(`Cannot cancel job with status ${job.status}`);
    }
    
    // Mark the job as failed
    return this.prisma.ingestionJob.update({
      where: { id },
      data: {
        status: Status.FAILED,
        completedAt: new Date(),
        output: 'Job was cancelled by user',
      },
    });
  }

  async findByDocument(documentId: number, userId: number, role: string): Promise<IngestionJob[]> {
    // Check if document exists
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    // Check if user has access to the document
    if (role !== 'ADMIN' && document.createdById !== userId) {
      throw new UnauthorizedException('You do not have permission to view ingestion jobs for this document');
    }

    // Get all ingestion jobs for the document
    return this.prisma.ingestionJob.findMany({
      where: { documentId },
      orderBy: { startedAt: 'desc' },
    });
  }
}