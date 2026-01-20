import { describe, it, expect } from 'vitest';
import { fetchOceanData } from './DataManager';

describe('DataManager', () => {
    it('should fetch ocean data correctly', async () => {
        const data = await fetchOceanData();
        expect(data).toBeDefined();
        expect(data.oceans).toBeInstanceOf(Array);
        expect(data.oceans.length).toBeGreaterThan(0);
        expect(data.oceans[0]).toHaveProperty('name');
    });
});
