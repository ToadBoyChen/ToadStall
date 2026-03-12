import ChartRenderer from './ChartRenderer';

export default async function DynamicChartWrapper({ blockData, isCompact = false }: { blockData: any, isCompact?: boolean }) {
    let finalData: any[] = [];

    // 1. Handle Manual Data Entry
    if (blockData.dataSource === 'manual' && blockData.chartData) {
        const formattedDataMap: Record<string, any> = {};

        blockData.chartData.forEach((series: any) => {
            const seriesName = series.seriesName || 'Value';

            if (series.dataPoints) {
                series.dataPoints.forEach((point: any) => {
                    const xLabel = point.label;
                    if (!formattedDataMap[xLabel]) formattedDataMap[xLabel] = { label: xLabel };
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
                    finalData = wbResponse[1]
                        .filter((item: any) => item.value !== null)
                        .sort((a: any, b: any) => parseInt(a.date) - parseInt(b.date))
                        .map((item: any) => ({ label: item.date, value: item.value }));
                }
            }
        } catch (error) {
            console.error("Failed to fetch World Bank data:", error);
        }
    }

    return (
        <div className={`flex flex-col w-full ${isCompact ? "mt-2" : "my-12"}`}>
            
            <div className={`${isCompact ? "h-48" : "h-72 sm:h-96"} w-full relative`}>
                <ChartRenderer 
                    type={blockData.chartType} 
                    data={finalData} 
                    isCompact={isCompact}
                    smartYAxis={blockData.smartYAxis} 
                />
            </div>

            {!isCompact && blockData.caption && (
                <p className="mt-4 text-center text-xs text-slate-400 font-medium italic">
                    {blockData.caption}
                </p>
            )}
        </div>
    );
}