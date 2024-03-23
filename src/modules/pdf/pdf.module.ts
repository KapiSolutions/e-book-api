import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { PdfController } from './pdf.controller';
import { CloudStorage } from 'src/providers/cloudStorage';
import { ModifyPDF } from 'src/providers/modifyPDF';
import { EmailSender } from 'src/providers/emailSender';

@Module({
  controllers: [PdfController],
  providers: [PdfService, CloudStorage, ModifyPDF, EmailSender],
})
export class PdfModule {}
