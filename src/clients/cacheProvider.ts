interface ICacheItem {
    value: unknown;
    expiresAt: number;
}

export class CacheProvider {
    private static storage = new Map<string, ICacheItem>();

    public static set<T>(key: string, value: T, ttlInSeconds: number): void {
        const item: ICacheItem = {
            value,
            expiresAt: CacheProvider.getCurrentTimeInSeconds() + ttlInSeconds
        };

        CacheProvider.storage.set(key, item);
    }

    public static get<T>(key: string): T | undefined {
        const item = CacheProvider.storage.get(key);

        if (!item) {
            return undefined;
        }

        if (item.expiresAt < CacheProvider.getCurrentTimeInSeconds()) {
            CacheProvider.storage.delete(key);
            return undefined;
        }

        return item.value as T;
    }

    private static getCurrentTimeInSeconds() {
        return Math.floor(Date.now() / 1000);
    }
}
