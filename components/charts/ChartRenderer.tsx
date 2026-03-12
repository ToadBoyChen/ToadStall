"use client";

import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { useState } from "react";

const COLORS = ["#10b981", "#6366f1", "#f43f5e", "#f59e0b", "#8b5cf6", "#0ea5e9", "#64748b"];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-md border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-xl p-3 min-w-35">
                <p className="font-black text-slate-800 mb-2 text-sm">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
                        <div className="flex items-center gap-2">
                            <span 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: entry.color }} 
                            />
                            <span className="text-slate-500 font-medium text-xs uppercase tracking-wide truncate max-w-25">
                                {entry.name}
                            </span>
                        </div>
                        <span className="text-slate-900 font-bold text-sm">
                            {typeof entry.value === 'number' && entry.value > 999 
                                ? entry.value.toLocaleString() 
                                : entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function ChartRenderer({ 
    type, 
    data, 
    isCompact = false,
    smartYAxis = false 
}: { 
    type: string; 
    data: any[]; 
    isCompact?: boolean;
    smartYAxis?: boolean;
}) {
    const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({});

    if (!data || data.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <p className="text-slate-400 text-center text-sm font-medium">No data available</p>
            </div>
        );
    }

    // 1. THE FIX: Recharts breaks if keys have dots in them (like SP.POP.TOTL). 
    // We create a safe copy of the data, replacing dots with spaces.
    const safeData = data.map(item => {
        const cleanItem: any = {};
        Object.keys(item).forEach(k => {
            const cleanKey = k.replace(/\./g, ' '); 
            cleanItem[cleanKey] = item[k];
        });
        return cleanItem;
    });

    const dataKeys = Object.keys(safeData[0]).filter(
        (key) => key !== "label" && key !== "_key" && key !== "_type"
    );

    const handleLegendClick = (e: any) => {
        const { dataKey } = e;
        setHiddenSeries((prev) => ({ ...prev, [dataKey]: !prev[dataKey] }));
    };

    const formatYAxis = (val: number) => {
        if (val === 0) return "0";
        if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}B`;
        if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
        return val.toString();
    };

    const chartMargin = isCompact
        ? { top: 10, right: 10, left: 0, bottom: 0 }
        : { top: 20, right: 20, left: 10, bottom: 0 };

    const renderChart = () => {
        switch (type) {
            case "bar":
                return (
                    <BarChart data={safeData} margin={chartMargin}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="label" stroke="#94a3b8" fontSize={isCompact ? 10 : 12} tickLine={false} axisLine={false} tickMargin={12} />
                        {!isCompact && (
                            <YAxis 
                                stroke="#94a3b8" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false} 
                                tickMargin={8}
                                width={45}
                                tickFormatter={formatYAxis}
                                domain={smartYAxis ? ['auto', 'auto'] : [0, 'auto']} 
                            />
                        )}
                        <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
                        {(!isCompact || dataKeys.length > 1) && (
                            <Legend onClick={handleLegendClick} iconType="circle" wrapperStyle={{ cursor: 'pointer', fontSize: '12px', color: '#64748b', paddingTop: '20px' }} />
                        )}
                        {dataKeys.map((key, index) => (
                            <Bar key={key} dataKey={key} fill={COLORS[index % COLORS.length]} radius={[6, 6, 0, 0]} hide={hiddenSeries[key]} barSize={isCompact ? 16 : 32} />
                        ))}
                    </BarChart>
                );

            case "line":
                return (
                    <LineChart data={safeData} margin={chartMargin}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="label" stroke="#94a3b8" fontSize={isCompact ? 10 : 12} tickLine={false} axisLine={false} tickMargin={12} />
                        {!isCompact && (
                            <YAxis 
                                stroke="#94a3b8" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false}
                                tickMargin={8}
                                width={45}
                                tickFormatter={formatYAxis}
                                domain={smartYAxis ? ['auto', 'auto'] : [0, 'auto']} 
                            />
                        )}
                        <Tooltip content={<CustomTooltip />} />
                        {(!isCompact || dataKeys.length > 1) && (
                            <Legend onClick={handleLegendClick} iconType="circle" wrapperStyle={{ cursor: 'pointer', fontSize: '12px', color: '#64748b', paddingTop: '20px' }} />
                        )}
                        {dataKeys.map((key, index) => (
                            <Line key={key} type="monotone" dataKey={key} stroke={COLORS[index % COLORS.length]} strokeWidth={2.5} dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: COLORS[index % COLORS.length] }} hide={hiddenSeries[key]} />
                        ))}
                    </LineChart>
                );

            case "pie":
            case "doughnut":
                const pieDataKey = dataKeys[0] || "value";
                return (
                    <PieChart>
                        <Tooltip content={<CustomTooltip />} />
                        <Pie
                            data={safeData}
                            innerRadius={type === "doughnut" ? "65%" : 0}
                            outerRadius="90%"
                            paddingAngle={type === "doughnut" ? 3 : 0}
                            dataKey={pieDataKey}
                            nameKey="label"
                            stroke="#ffffff"
                            strokeWidth={type === "pie" ? 2 : 0}
                        >
                            {safeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        {(!isCompact || dataKeys.length > 1) && (
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
                        )}
                    </PieChart>
                );

            default:
                return <p className="text-slate-400 text-center text-sm">Unsupported chart type</p>;
        }
    };

    return (
        <div className="w-full h-full min-h-75 animate-in fade-in duration-1000 ease-out">
            <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
            </ResponsiveContainer>
        </div>
    );
}