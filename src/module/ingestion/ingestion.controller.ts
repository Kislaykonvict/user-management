import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req,
    ParseIntPipe,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { IngestionService } from './ingestion.service';
  import { CreateIngestionJobDto, UpdateIngestionJobDto } from './dto/ingestion.dto'; 
  import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
  import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../common/decorators/roles.decorator';
  import { IngestionJobDto } from './dto/ingestion.dto';
  
  @ApiTags('ingestion')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Controller('ingestion')
  export class IngestionController {
    constructor(
        private readonly ingestionService: IngestionService,
    ) {}
  
    @Post()
    @ApiOperation({ summary: 'Create a new ingestion job' })
    @ApiResponse({ status: 201, description: 'Ingestion job created successfully', type: IngestionJobDto })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Document not found' })
    async create(@Body() createIngestionJobDto: CreateIngestionJobDto, @Req() req) {
      return this.ingestionService.create(createIngestionJobDto, req.user.id);
    }
  
    @Get()
    @ApiOperation({ summary: 'Get all ingestion jobs' })
    @ApiResponse({ status: 200, description: 'Returns all ingestion jobs', type: [IngestionJobDto] })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async findAll(@Req() req) {
      return this.ingestionService.findAll(req.user.id, req.user.role);
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get an ingestion job by ID' })
    @ApiResponse({ status: 200, description: 'Returns the ingestion job', type: IngestionJobDto })
    @ApiResponse({ status: 404, description: 'Ingestion job not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
      return this.ingestionService.findOne(id, req.user.id, req.user.role);
    }
  
    @Patch(':id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Update an ingestion job (Admin only)' })
    @ApiResponse({ status: 200, description: 'Ingestion job updated successfully', type: IngestionJobDto })
    @ApiResponse({ status: 404, description: 'Ingestion job not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - requires admin role' })
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateIngestionJobDto: UpdateIngestionJobDto,
      @Req() req,
    ) {
      return this.ingestionService.update(id, updateIngestionJobDto, req.user.id, req.user.role);
    }
  
    @Delete(':id/cancel')
    @ApiOperation({ summary: 'Cancel an ingestion job' })
    @ApiResponse({ status: 200, description: 'Ingestion job cancelled successfully', type: IngestionJobDto })
    @ApiResponse({ status: 400, description: 'Bad request - cannot cancel completed/failed jobs' })
    @ApiResponse({ status: 404, description: 'Ingestion job not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async cancel(@Param('id', ParseIntPipe) id: number, @Req() req) {
      return this.ingestionService.cancel(id, req.user.id, req.user.role);
    }
  
    @Get('document/:documentId')
    @ApiOperation({ summary: 'Get all ingestion jobs for a document' })
    @ApiResponse({ status: 200, description: 'Returns all ingestion jobs for the document', type: [IngestionJobDto] })
    @ApiResponse({ status: 404, description: 'Document not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async findByDocument(@Param('documentId', ParseIntPipe) documentId: number, @Req() req) {
      return this.ingestionService.findByDocument(documentId, req.user.id, req.user.role);
    }
  }