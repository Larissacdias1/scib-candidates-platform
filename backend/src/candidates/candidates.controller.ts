import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CandidatesService } from './services';
import { CreateCandidateDto, UpdateCandidateDto, CandidateResponseDto } from './dto';

interface UploadedFileType {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_, file, cb) => {
        const allowed = [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
        ];

        if (!allowed.includes(file.mimetype)) {
          cb(new BadRequestException('Only Excel files are allowed'), false);
          return;
        }

        cb(null, true);
      },
    }),
  )
  async create(
    @Body() dto: CreateCandidateDto,
    @UploadedFile() file: UploadedFileType,
  ): Promise<CandidateResponseDto> {
    if (!file) {
      throw new BadRequestException('Excel file is required');
    }

    return this.candidatesService.create(dto, file.buffer);
  }

  @Get()
  findAll(): Promise<CandidateResponseDto[]> {
    return this.candidatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CandidateResponseDto> {
    return this.candidatesService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCandidateDto,
  ): Promise<CandidateResponseDto> {
    return this.candidatesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.candidatesService.remove(id);
  }
}
