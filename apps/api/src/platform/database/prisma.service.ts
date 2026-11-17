import { Inject, Injectable, type OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type Prisma } from '../../generated/prisma/client';
import { APP_CONFIG, type AppConfig } from '../config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    super({ adapter: new PrismaPg({ connectionString: config.DATABASE_URL }) });
  }

  inFamily<T>(familyId: string, work: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.$transaction(async (tx) => {
      await this.enterFamily(tx, familyId);
      return work(tx);
    });
  }

  async enterFamily(tx: Prisma.TransactionClient, familyId: string): Promise<void> {
    await tx.$queryRaw`SELECT set_config('app.family_id', ${familyId}, true)`;
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
