import { Injectable } from '@nestjs/common';
import { Order } from 'src/modules/stripe/entities/order.entity';
import * as fs from 'fs';
import {
  PDFDocument,
  PDFEmbeddedPage,
  PDFFont,
  PDFPage,
  rgb,
  StandardFonts,
} from 'pdf-lib';

@Injectable()
export class ModifyPDF {
  private pdfDoc: PDFDocument | null;
  private font: PDFFont;
  coverPages: Array<number>;
  client: Order['client'];

  constructor() {
    this.pdfDoc = null;
  }

  // Initailize and modify PDF document
  async start(
    basePDF: Buffer,
    coverPages: Array<number>,
    client: Order['client'],
  ): Promise<Buffer> {
    this.coverPages = coverPages;
    this.client = client;
    this.pdfDoc = await PDFDocument.load(basePDF);
    this.font = await this.pdfDoc.embedFont(StandardFonts.Helvetica);
    // Get watermark background image
    const watermarkBytes = fs.readFileSync('./public/watermark-1.pdf');
    const [watermarkImage] = await this.pdfDoc.embedPdf(watermarkBytes);

    // Add watermark to specified doc pages
    this.watermarkPDF(watermarkImage);
    // Update doc metadata
    this.updateMetadata();

    const finalPdf = await this.getPDF();
    return finalPdf;
  }

  private watermarkPDF(watermarkImage: PDFEmbeddedPage): void {
    if (!this.pdfDoc) {
      throw new Error('PDF document not initialized.');
    }
    const totalPages = this.pdfDoc.getPageCount();

    // Add watermark to all pages that are not covers
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const page = this.pdfDoc.getPages()[pageIndex];
      if (!this.coverPages.includes(pageIndex + 1)) {
        this.addWatermarkToPage(page, watermarkImage);
      }
    }
  }

  private addWatermarkToPage(
    page: PDFPage,
    watermarkImage: PDFEmbeddedPage,
  ): void {
    // Add watermark background image
    page.drawPage(watermarkImage);

    // Draw clients details
    page.drawText(
      `Wersja e-book'a przeznaczona dla: ${this.client.name} (${this.client.email}).`,
      {
        x: 26,
        y: 15,
        size: 8,
        font: this.font,
        color: rgb(0.1, 0.1, 0.1),
      },
    );
  }

  private updateMetadata(): void {
    const author = 'Pan Niezniszczalny';
    const subject = `E-book do użytku wyłącznie dla: ${this.client.name} (${this.client.email})`;
    const keywords = [
      author,
      'E-book',
      this.client.name || '',
      this.client.email || '',
    ];

    if (!this.pdfDoc) {
      throw new Error('PDF document not initialized.');
    }
    // Modify specific metadata properties
    this.pdfDoc.setAuthor(author);
    this.pdfDoc.setSubject(subject);
    this.pdfDoc.setKeywords(keywords);
    this.pdfDoc.setProducer(author);
    this.pdfDoc.setCreator(author);
  }

  // Return modified document
  private async getPDF(): Promise<Buffer> {
    if (!this.pdfDoc) {
      throw new Error('PDF document not initialized.');
    }
    const pdfBytes = await this.pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}
