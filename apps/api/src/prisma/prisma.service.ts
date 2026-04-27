import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/client';

/**
 * Prisma connects lazily on first query. Step 0 does not hit the DB, so the API can run without
 * PostgreSQL; use a valid DATABASE_URL before persisting data.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
