import { Injectable } from '@nestjs/common';
import {
  PDFDocument,
  PDFFont,
  PDFImage,
  PDFPage,
  rgb,
  StandardFonts,
} from 'pdf-lib';
import * as fs from 'fs';
import { Order } from 'src/modules/stripe/entities/order.entity';

@Injectable()
export class ModifyPDF {
  async addWatermak(
    file: Buffer,
    coverPages: Array<number>,
    client?: Order['client'],
  ): Promise<Buffer> {
    const pdfDoc = await PDFDocument.load(file);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const imageBytes = fs.readFileSync('./public/watermark.png');
    const image = await pdfDoc.embedPng(imageBytes);
    const totalPages = pdfDoc.getPageCount();

    // Modify PDF metadata
    pdfDoc.setAuthor('Pan Niezniszczalny');
    pdfDoc.setSubject(
      `E-book do użytku wyłącznie dla: ${client?.name} (${client?.email})`,
    );
    pdfDoc.setKeywords([
      'Pan Niezniszczalny',
      'E-book',
      client?.name || '',
      client?.email || '',
    ]);
    pdfDoc.setProducer('Pan Niezniszczalny');
    pdfDoc.setCreator('Pan Niezniszczalny');

    // Add watermark to all pages that are not covers
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const page = pdfDoc.getPages()[pageIndex];
      if (!coverPages.includes(pageIndex + 1)) {
        this.drawWatermark(page, helveticaFont, image, client);
      }
    }

    const pdfBytes = await pdfDoc.save();
    // fs.writeFileSync('./tmp/test.pdf', pdfBytes);
    return Buffer.from(pdfBytes);
  }

  private drawWatermark(
    page: PDFPage,
    font: PDFFont,
    image: PDFImage,
    client?: Order['client'],
  ): void {
    const { width, height } = page.getSize();
    // console.log('page width : ', width);
    // console.log('page height : ', height);
    page.drawImage(image, {
      x: 50,
      y: 80,
      width: 178,
      height: 300,
    });
    page.drawText(
      `Wersja e-book'a przeznaczona dla: ${client?.name}(${client?.email}).`,
      {
        x: 10,
        y: 25,
        size: 8,
        font: font,
        color: rgb(0, 0, 0),
      },
    );
    page.drawText(
      'Regulamin korzystania dostepny pod adresem: www.example.pl/regulamin',
      {
        x: 10,
        y: 15,
        size: 8,
        font: font,
        color: rgb(0, 0, 0),
      },
    );
  }
}
