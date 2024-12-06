import { knownFolders } from '@nativescript/core';
import { APP_CONSTANTS } from './constants';
import { logger } from './logger';

export class CacheManager {
    private static instance: CacheManager;
    private cacheFolder = knownFolders.documents().getFolder('cache');

    private constructor() {
        this.initializeCache();
    }

    static getInstance(): CacheManager {
        if (!CacheManager.instance) {
            CacheManager.instance = new CacheManager();
        }
        return CacheManager.instance;
    }

    private initializeCache(): void {
        try {
            if (!this.cacheFolder.contains('metadata.json')) {
                this.cacheFolder.writeTextSync('metadata.json', JSON.stringify({
                    lastCleanup: new Date().toISOString(),
                    size: 0
                }));
            }
        } catch (error) {
            logger.error('[CacheManager] Failed to initialize cache:', error);
        }
    }

    async set(key: string, data: any, ttl: number = APP_CONSTANTS.TIMEOUTS.CACHE_DURATION): Promise<void> {
        try {
            const cacheEntry = {
                data,
                timestamp: Date.now(),
                expiresAt: Date.now() + ttl
            };

            await this.cacheFolder.writeText(
                `${key}.json`,
                JSON.stringify(cacheEntry)
            );

            await this.updateCacheSize();
        } catch (error) {
            logger.error('[CacheManager] Failed to set cache:', error);
        }
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            const file = this.cacheFolder.getFile(`${key}.json`);
            if (!file.exists()) return null;

            const content = await file.readText();
            const cacheEntry = JSON.parse(content);

            if (Date.now() > cacheEntry.expiresAt) {
                await file.remove();
                return null;
            }

            return cacheEntry.data as T;
        } catch (error) {
            logger.error('[CacheManager] Failed to get cache:', error);
            return null;
        }
    }

    async clear(): Promise<void> {
        try {
            const files = this.cacheFolder.getEntities();
            await Promise.all(files.map(file => file.remove()));
            await this.initializeCache();
        } catch (error) {
            logger.error('[CacheManager] Failed to clear cache:', error);
        }
    }

    private async updateCacheSize(): Promise<void> {
        try {
            const metadata = JSON.parse(
                await this.cacheFolder.getFile('metadata.json').readText()
            );

            let totalSize = 0;
            const files = this.cacheFolder.getEntities();
            
            files.forEach(file => {
                totalSize += file.size;
            });

            if (totalSize > APP_CONSTANTS.LIMITS.MAX_CACHE_SIZE) {
                await this.cleanupOldCache();
            }

            metadata.size = totalSize;
            metadata.lastCleanup = new Date().toISOString();

            await this.cacheFolder.writeText(
                'metadata.json',
                JSON.stringify(metadata)
            );
        } catch (error) {
            logger.error('[CacheManager] Failed to update cache size:', error);
        }
    }

    private async cleanupOldCache(): Promise<void> {
        try {
            const files = this.cacheFolder.getEntities();
            const now = Date.now();

            for (const file of files) {
                if (file.name === 'metadata.json') continue;

                try {
                    const content = await file.readText();
                    const cacheEntry = JSON.parse(content);

                    if (now > cacheEntry.expiresAt) {
                        await file.remove();
                    }
                } catch (error) {
                    // If we can't read the file, remove it
                    await file.remove();
                }
            }
        } catch (error) {
            logger.error('[CacheManager] Failed to cleanup cache:', error);
        }
    }
}