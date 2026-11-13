import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
  NoSuchKey,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Inject, Injectable, Logger, type OnApplicationShutdown, type OnModuleInit } from '@nestjs/common';
import { APP_CONFIG, type AppConfig } from '../config';

@Injectable()
export class StorageService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    this.bucket = config.S3_BUCKET;
    this.client = new S3Client({
      endpoint: config.S3_ENDPOINT,
      region: config.S3_REGION,
      forcePathStyle: true,
      credentials: { accessKeyId: config.S3_ACCESS_KEY, secretAccessKey: config.S3_SECRET_KEY },
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      try {
        await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
      } catch (error) {
        this.logger.warn(`bucket check failed: ${error instanceof Error ? error.name : 'unknown error'}`);
      }
    }
  }

  async put(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.client.send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: body, ContentType: contentType }));
  }

  async get(key: string): Promise<Buffer | null> {
    try {
      const object = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
      return object.Body ? Buffer.from(await object.Body.transformToByteArray()) : null;
    } catch (error) {
      if (error instanceof NoSuchKey) {
        return null;
      }
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  async list(prefix: string): Promise<string[]> {
    const keys: string[] = [];
    let token: string | undefined;
    do {
      const page = await this.client.send(
        new ListObjectsV2Command({ Bucket: this.bucket, Prefix: prefix, ContinuationToken: token })
      );
      for (const object of page.Contents ?? []) {
        if (object.Key) {
          keys.push(object.Key);
        }
      }
      token = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (token);
    return keys;
  }

  async removePrefix(prefix: string): Promise<void> {
    let token: string | undefined;
    do {
      const page = await this.client.send(
        new ListObjectsV2Command({ Bucket: this.bucket, Prefix: prefix, ContinuationToken: token })
      );
      for (const object of page.Contents ?? []) {
        if (object.Key) {
          await this.remove(object.Key);
        }
      }
      token = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (token);
  }

  onApplicationShutdown(): void {
    this.client.destroy();
  }
}
