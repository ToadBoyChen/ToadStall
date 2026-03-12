import ChartRenderer from './ChartRenderer';

export default async function DynamicChartWrapper({ blockData, isCompact = false }: { blockData: any, isCompact?: boolean }) {
    let finalData: any[] = [];

    if (blockData.dataSource === 'manual' && blockData.chartData) {
        const formattedDataMap: Record<string, any> = {};

        blockData.chartData.forEach((series: any) => {
            const seriesName = series.seriesName || 'Value';

            if (series.dataPoints) {
                series.dataPoints.forEach((point: any) => {
                    const xLabel = point.label;

                    if (!formattedDataMap[xLabel]) {
                        formattedDataMap[xLabel] = { label: xLabel };
                    }

                    formattedDataMap[xLabel][seriesName] = point.value;
                });
            }
        });

        finalData = Object.values(formattedDataMap);
    }

    if (blockData.dataSource === 'worldbank' && blockData.wbIndicator) {
        try {
            const countryCode = blockData.wbCountry || 'ALL';

            const dateQuery = (blockData.startYear && blockData.endYear)
                ? `&date=${blockData.startYear}:${blockData.endYear}`
                : '';

            const wbUrl = `https://api.worldbank.org/v2/country/${countryCode}/indicator/${blockData.wbIndicator}?format=json&per_page=100${dateQuery}`;

            const res = await fetch(wbUrl, { next: { revalidate: 3600 } });

            if (res.ok) {
                const wbResponse = await res.json();

                if (Array.isArray(wbResponse) && wbResponse.length > 1 && Array.isArray(wbResponse[1])) {
                    const rawData = wbResponse[1];

                    finalData = rawData
                        .filter((item: any) => item.value !== null)
                        .sort((a: any, b: any) => parseInt(a.date) - parseInt(b.date))
                        .map((item: any) => ({
                            label: item.date,
                            value: item.value
                        }));
                }
            } else {
                console.error("World Bank API Error:", res.statusText);
            }
        } catch (error) {
            console.error("Failed to fetch World Bank data:", error);
        }
    }

    return (
        <div className={isCompact ? "w-full h-48 mt-2 relative" : "my-10 p-2 rounded-2xl border border-slate-200 shadow-md h-96 w-full relative"}>
            <ChartRenderer type={blockData.chartType} data={finalData} isCompact={isCompact} />

            {!isCompact && blockData.caption && (
                <p className="text-center text-sm text-slate-500 mt-6 italic">
                    {blockData.caption}
                </p>
            )}
        </div>
    );
}