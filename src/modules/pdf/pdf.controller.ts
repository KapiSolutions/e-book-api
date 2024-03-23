import { Controller, Get, Query } from '@nestjs/common';
import { PdfService } from './pdf.service';

export interface Data {
  coverPages: number[];
  docName: string;
  finalDocName: string;
  clientName: string;
  clientEmail: string;
}

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get()
  processPDF(
    @Query('coverPages') coverPages: string,
    @Query('docName') docName: string,
    @Query('finalDocName') finalDocName: string,
    @Query('clientName') clientName: string,
    @Query('clientEmail') clientEmail: string,
  ) {
    const coverPagesArr = coverPages
      ?.split(',')
      .map((str) => parseInt(str.trim(), 10));

    const data = {
      coverPages: coverPagesArr,
      docName,
      finalDocName,
      clientName,
      clientEmail,
    };

    return this.pdfService.processPDF(data);
  }
}
