export interface ExplorerDataPoint {
    label: string;
    [key: string]: any;
}

export interface DataProvider {
    id: string;
    name: string;
    getCountries: () => Promise<{ code: string; name: string }[]>;
    getIndicators: () => Promise<{ id: string; label: string }[]>;
    fetchData: (
        indicatorId: string,
        indicatorLabel: string,
        countryCode: string,
        startYear: string,
        endYear: string
    ) => Promise<ExplorerDataPoint[]>;
}

// Module-level cache so the countries list is only fetched once per page session.
let countriesCache: { code: string; name: string }[] | null = null;

export const WorldBankProvider: DataProvider = {
    id: 'worldbank',
    name: 'World Bank API',

    getCountries: async () => {
        if (countriesCache) return countriesCache;
        const res = await fetch('/api/worldbank/countries');
        if (!res.ok) throw new Error('Failed to fetch countries');
        countriesCache = await res.json();
        return countriesCache!;
    },

    getIndicators: async () => {
        try {
            const indicators = (await import('./worldBankIndicators.json')).default;
            return indicators;
        } catch (error) {
            console.error('Failed to load indicators:', error);
            return [];
        }
    },

    fetchData: async (indicatorId, indicatorLabel, countryCode, startYear, endYear) => {
        const params = new URLSearchParams({
            indicator: indicatorId,
            country: countryCode,
            start: startYear,
            end: endYear,
        });
        const res = await fetch(`/api/worldbank?${params}`);
        if (!res.ok) throw new Error('Failed to fetch data');

        const { data, countryName, error } = await res.json();
        if (error) throw new Error(error);
        if (!data || data.length === 0) return [];

        // Re-key to use indicatorLabel so ChartRenderer labels the series correctly.
        return data.map((point: any) => {
            const { label, ...rest } = point;
            const value = Object.values(rest)[0] as number;
            return { label, [indicatorLabel]: value };
        });
    },
};
