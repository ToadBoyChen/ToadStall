'use client';

import { useState, useEffect } from 'react';
import StaticChart from './StaticChart';

function buildManualData(blockData: any): any[] {
    const dataMap: Record<string, any> = {};
    blockData.chartData?.forEach((series: any) => {
        const name = series.seriesName || 'Value';
        series.dataPoints?.forEach((point: any) => {
            if (!dataMap[point.label]) dataMap[point.label] = { label: point.label };
            dataMap[point.label][name] = point.value;
        });
    });
    return Object.values(dataMap);
}

export default function DynamicChartWrapper({
    blockData,
    isCompact = false,
}: {
    blockData: any;
    isCompact?: boolean;
}) {
    const isWorldBank = blockData.dataSource === 'worldbank' && blockData.wbIndicator;

    // Manual data is derived synchronously — no network call, no loading state.
    const [data, setData] = useState<any[]>(() =>
        isWorldBank ? [] : buildManualData(blockData)
    );
    const [title, setTitle] = useState<string>(blockData.title || '');
    const [subtitle, setSubtitle] = useState<string>(blockData.subtitle || '');
    const [isLoading, setIsLoading] = useState(isWorldBank);

    useEffect(() => {
        if (!isWorldBank) return;

        const seriesList: { countryCode: string; seriesLabel?: string }[] =
            blockData.wbSeries?.length > 0
                ? blockData.wbSeries
                : [{ countryCode: blockData.wbCountry || 'WLD' }];

        const start = blockData.startYear || '2000';
        const end = blockData.endYear || new Date().getFullYear().toString();

        const fetchAll = async () => {
            setIsLoading(true);
            try {
                // Fetch all series in parallel through the cached proxy route.
                const results = await Promise.all(
                    seriesList.map(async (s) => {
                        const params = new URLSearchParams({
                            indicator: blockData.wbIndicator,
                            country: s.countryCode,
                            start,
                            end,
                        });
                        const res = await fetch(`/api/worldbank?${params}`);
                        if (!res.ok) return null;
                        const json = await res.json();
                        if (json.error) return null;
                        return { series: s, json };
                    })
                );

                let indicatorLabel = '';
                const dataMap: Record<string, any> = {};

                results.forEach((result) => {
                    if (!result?.json?.data) return;
                    const { series, json } = result;
                    if (!indicatorLabel) indicatorLabel = json.indicatorLabel || '';

                    // Use the custom label if set, otherwise fall back to the
                    // country name returned by the API.
                    const seriesName = series.seriesLabel || json.countryName || series.countryCode;

                    json.data.forEach((point: any) => {
                        if (!dataMap[point.label]) dataMap[point.label] = { label: point.label };
                        // Each point is { label, [countryName]: value } — extract the value.
                        const value = Object.entries(point).find(([k]) => k !== 'label')?.[1];
                        if (value !== undefined) dataMap[point.label][seriesName] = value;
                    });
                });

                const merged = Object.values(dataMap).sort(
                    (a, b) => parseInt(a.label) - parseInt(b.label)
                );

                setData(merged);

                if (!blockData.title && indicatorLabel) setTitle(indicatorLabel);
                if (!blockData.subtitle) {
                    setSubtitle(
                        seriesList.length > 1
                            ? seriesList.map((s) => s.seriesLabel || s.countryCode).join(' · ')
                            : (results[0]?.json?.countryName ?? '')
                    );
                }
            } catch (err) {
                console.error('Failed to fetch chart data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (isLoading) {
        return (
            <div
                className={`w-full animate-pulse bg-slate-100 rounded-2xl ${
                    isCompact ? 'h-48' : 'h-72 sm:h-96 my-12'
                }`}
            />
        );
    }

    return (
        <StaticChart
            title={title}
            subtitle={subtitle}
            data={data}
            chartType={blockData.chartType}
            smartYAxis={blockData.smartYAxis}
            isCompact={isCompact}
            caption={blockData.caption}
        />
    );
}
