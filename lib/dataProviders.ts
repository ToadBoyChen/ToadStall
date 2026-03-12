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

export const WorldBankProvider: DataProvider = {
    id: 'worldbank',
    name: 'World Bank API',

    getCountries: async () => {
        const res = await fetch('https://api.worldbank.org/v2/country?format=json&per_page=300');
        const json = await res.json();
        return json[1]
            .filter((c: any) => c.region.id !== "NA")
            .map((c: any) => ({ code: c.id, name: c.name }))
            .sort((a: any, b: any) => a.name.localeCompare(b.name));
    },

    getIndicators: async () => {
        try {
            const indicators = (await import('./worldBankIndicators.json')).default;
            return indicators;
        } catch (error) {
            console.error("Failed to load indicators:", error);
            return [];
        }
    },

    fetchData: async (indicatorId, indicatorLabel, countryCode, startYear, endYear) => {
        const url = `https://api.worldbank.org/v2/country/${countryCode}/indicator/${indicatorId}?format=json&date=${startYear}:${endYear}&per_page=100`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch from World Bank");

        const json = await res.json();
        if (json[0]?.message) throw new Error(json[0].message[0].value);

        const rawData = json[1];
        if (!rawData || rawData.length === 0) return [];

        return rawData
            .filter((item: any) => item.value !== null)
            .sort((a: any, b: any) => parseInt(a.date) - parseInt(b.date))
            .map((item: any) => ({
                label: item.date,
                [indicatorLabel]: item.value
            }));
    }
};

// --- FUTURE UNICEF PROVIDER ---
// export const UnicefProvider: DataProvider = { ... }