import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { BadRequestException, Injectable } from '@nestjs/common';

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

type UploadedPhotoFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
};

function mustEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing env: ${name}`);
  }

  return value;
}

@Injectable()
export class MediaService {
  private readonly bucketName: string;
  private readonly s3: S3Client;
  private readonly publicBaseUrl: string;

  constructor() {
    const region = mustEnv('AWS_REGION');
    const endpoint = mustEnv('AWS_ENDPOINT');
    this.bucketName = mustEnv('AWS_S3_BUCKET');
    const endpointHost = endpoint.replace(/^https?:\/\//, '').replace(/\/$/, '');

    this.publicBaseUrl =
      process.env.AWS_PUBLIC_BASE_URL ||
      `https://${this.bucketName}.${endpointHost}`;

    this.s3 = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId: mustEnv('AWS_ACCESS_KEY_ID'),
        secretAccessKey: mustEnv('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async uploadPhoto(file?: UploadedPhotoFile) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    if (!ALLOWED_TYPES.has(file.mimetype)) {
      throw new BadRequestException(
        'Unsupported file type. Use JPEG, PNG, WebP, or GIF.',
      );
    }

    const extension = (file.mimetype.split('/')?.[1] ?? 'jpg').toLowerCase();
    const key = `transfer-proofs/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}.${extension}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      }),
    );

    const publicUrl = `${this.publicBaseUrl.replace(/\/$/, '')}/${key}`;

    return {
      url: publicUrl,
      original: publicUrl,
      path: publicUrl,
    };
  }
}
