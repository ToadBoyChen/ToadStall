"use client";

import ChartRenderer from "./ChartRenderer";

interface StaticChartProps {
    title?: string;
    subtitle?: string;
    data: any[];
    chartType: 'line' | 'bar' | 'pie' | 'doughnut';
    smartYAxis?: boolean;
    isCompact?: boolean;
    caption?: string;
}

export default function StaticChart({
    title,
    subtitle,
    data,
    chartType,
    smartYAxis = false,
    isCompact = false,
    caption
}: StaticChartProps) {
    if (isCompact) {
        return (
            <div className="w-full mt-2 h-48">
                <ChartRenderer type={chartType} data={data} isCompact smartYAxis={smartYAxis} />
            </div>
        );
    }

    return (
        <div className="my-12 w-full">
            {(title || subtitle) && (
                <div className="flex flex-col gap-1 mb-6">
                    {title && (
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                            {title}
                        </h3>
                    )}
                    {subtitle && (
                        <p className="text-sm font-medium text-slate-500">{subtitle}</p>
                    )}
                </div>
            )}

            <div className="relative bg-slate-50/60 rounded-2xl p-3 sm:p-5" style={{ height: 380 }}>
                <ChartRenderer type={chartType} data={data} isCompact={false} smartYAxis={smartYAxis} />
            </div>

            {caption && (
                <p className="mt-3 text-center text-xs text-slate-400 font-medium italic">
                    {caption}
                </p>
            )}
        </div>
    );
}