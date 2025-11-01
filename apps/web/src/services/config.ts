import { db } from '@/db/client';
import { configs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';

export interface Config {
  key: string;
  value: string;
  updatedAt: Date;
}

export async function getAllConfigs(): Promise<Config[]> {
  try {
    const result = await db.select().from(configs);
    return result;
  } catch (error) {
    logger.error('Error getting all configs', { error });
    throw new Error('Failed to get configs');
  }
}

export async function getConfigByKey(key: string): Promise<Config | null> {
  try {
    const result = await db
      .select()
      .from(configs)
      .where(eq(configs.key, key))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    logger.error('Error getting config by key', { error, key });
    throw new Error('Failed to get config');
  }
}

export async function upsertConfig(
  key: string,
  value: string
): Promise<Config> {
  try {
    const result = await db
      .insert(configs)
      .values({ key, value })
      .onConflictDoUpdate({
        target: configs.key,
        set: { value, updatedAt: new Date() },
      })
      .returning();

    logger.info('Config upserted', { key });
    return result[0];
  } catch (error) {
    logger.error('Error upserting config', { error, key });
    throw new Error('Failed to upsert config');
  }
}

export async function deleteConfig(key: string): Promise<void> {
  try {
    await db.delete(configs).where(eq(configs.key, key));
    logger.info('Config deleted', { key });
  } catch (error) {
    logger.error('Error deleting config', { error, key });
    throw new Error('Failed to delete config');
  }
}
