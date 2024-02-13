import { Injectable } from '@nestjs/common';
import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'pdf-lib';
import { Order } from 'src/modules/stripe/entities/order.entity';

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
    this.addWatermark();
    this.updateMetadata();
    const finalPdf = await this.getPDF();
    return finalPdf;
  }

  private addWatermark(): void {
    if (!this.pdfDoc) {
      throw new Error('PDF document not initialized.');
    }
    const totalPages = this.pdfDoc.getPageCount();
    // Add watermark to all pages that are not covers
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const page = this.pdfDoc.getPages()[pageIndex];
      if (!this.coverPages.includes(pageIndex + 1)) {
        this.drawWatermark(page);
      }
    }
  }
  private drawWatermark(page: PDFPage): void {
    // Draw clients details
    page.drawText(
      `Wersja e-book'a przeznaczona dla: ${this.client.name}(${this.client.email}).`,
      {
        x: 10,
        y: 25,
        size: 8,
        font: this.font,
        color: rgb(0, 0, 0),
      },
    );
    // Draw regulations information
    page.drawText(
      'Regulamin korzystania dostepny pod adresem: www.example.pl/regulamin',
      {
        x: 10,
        y: 15,
        size: 8,
        font: this.font,
        color: rgb(0, 0, 0),
      },
    );
  }
  private updateMetadata(): void {
    if (!this.pdfDoc) {
      throw new Error('PDF document not initialized.');
    }
    this.pdfDoc.setAuthor('Pan Niezniszczalny');
    this.pdfDoc.setSubject(
      `E-book do użytku wyłącznie dla: ${this.client.name} (${this.client.email})`,
    );
    this.pdfDoc.setKeywords([
      'Pan Niezniszczalny',
      'E-book',
      this.client.name || '',
      this.client.email || '',
    ]);
    this.pdfDoc.setProducer('Pan Niezniszczalny');
    this.pdfDoc.setCreator('Pan Niezniszczalny');
  }
  // Get modified document
  private async getPDF(): Promise<Buffer> {
    if (!this.pdfDoc) {
      throw new Error('PDF document not initialized.');
    }
    const pdfBytes = await this.pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}
