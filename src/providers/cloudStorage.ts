import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';

@Injectable()
export class CloudStorage {
  private readonly storage;

  constructor() {
    const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (!credentials) {
      throw new Error('Credentials does not exist.');
    }

    this.storage = new Storage({
      credentials: JSON.parse(credentials),
    });
  }

  async downloadFile(bucketName: string, filePath: string): Promise<Buffer> {
    const bucket = this.storage.bucket(bucketName);
    const file = bucket.file(filePath);

    const [fileContent] = await file.download();

    return fileContent;
  }
}
