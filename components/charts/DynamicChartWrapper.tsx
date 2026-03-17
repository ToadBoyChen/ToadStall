import StaticChart from './StaticChart';

export default async function DynamicChartWrapper({ blockData, isCompact = false }: { blockData: any, isCompact?: boolean }) {
    let finalData: any[] = [];
    let title = blockData.title || "";
    let subtitle = blockData.subtitle || "";

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
                    
                    if (!title && wbResponse[1][0]?.indicator?.value) title = wbResponse[1][0].indicator.value;
                    if (!subtitle && wbResponse[1][0]?.country?.value) subtitle = wbResponse[1][0].country.value;
                }
            }
        } catch (error) {
            console.error("Failed to fetch World Bank data:", error);
        }
    }

    return (
        <StaticChart
            title={title}
            subtitle={subtitle}
            data={finalData}
            chartType={blockData.chartType}
            smartYAxis={blockData.smartYAxis}
            isCompact={isCompact}
            caption={blockData.caption}
        />
    );
}