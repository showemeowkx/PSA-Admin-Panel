/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  private logger = new Logger(CloudinaryService.name);

  uploadFile(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    this.logger.verbose('Uploading a file...');

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'vikte_uploads' },
        (error, result) => {
          if (error) {
            this.logger.error(`Upload failed: ${error.stack}`);
            return reject(error);
          }
          if (result) {
            this.logger.error('File uploaded seccussfully!');
            resolve(result);
          } else {
            this.logger.error('Upload failed: Unknown error');
            reject(new Error('Upload failed'));
          }
        },
      );

      const stream = new Readable();
      stream.push(file.buffer);
      stream.push(null);

      stream.pipe(uploadStream);
    });
  }

  async deleteFile(url: string): Promise<void> {
    this.logger.verbose(
      `Deleting a file from cloud... {url: ${url.slice(15)}...}`,
    );

    const publicId = this.extractPublicId(url);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  }

  private extractPublicId(url: string): string | null {
    const regex = /\/v\d+\/([^/]+)\/([^.]+)\./;
    const match = url.match(regex);
    if (match) {
      return `${match[1]}/${match[2]}`;
    }
    return null;
  }
}
