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
    return (
        <div className={`flex flex-col w-full ${isCompact ? "mt-2" : "my-12"}`}>
            {!isCompact && (title || subtitle) && (
                <div className="mb-6">
                    {title && <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">{title}</h3>}
                    {subtitle && <p className="text-sm font-medium text-slate-500 mt-1">{subtitle}</p>}
                </div>
            )}

            <div className={`${isCompact ? "h-48" : "h-72 sm:h-96"} w-full relative`}>
                <ChartRenderer 
                    type={chartType} 
                    data={data} 
                    isCompact={isCompact}
                    smartYAxis={smartYAxis} 
                />
            </div>

            {!isCompact && caption && (
                <p className="mt-4 text-center text-xs text-slate-400 font-medium italic">
                    {caption}
                </p>
            )}
        </div>
    );
}