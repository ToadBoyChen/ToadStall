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
            <div className="bg-white/90 backdrop-blur-md border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-xl p-3 min-w-35 z-50">
                <p className="font-black text-slate-800 mb-2 text-sm">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
                        <div className="flex items-center gap-2">
                            <span
                                className="w-2 h-2 rounded-full min-w-2"
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
            <div/>
        );
    }

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
        ? { top: 5, right: 5, left: -20, bottom: 0 }
        : { top: 10, right: 10, left: 0, bottom: 0 };

    const renderChart = () => {
        switch (type) {
            case "bar":
                return (
                    <BarChart data={safeData} margin={chartMargin}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="label" stroke="#94a3b8" fontSize={isCompact ? 10 : 12} tickLine={false} axisLine={false} tickMargin={8} />
                        {!isCompact && (
                            <YAxis
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickMargin={4}
                                tickFormatter={formatYAxis}
                                domain={smartYAxis ? ['auto', 'auto'] : [0, 'auto']}
                            />
                        )}
                        <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
                        {(!isCompact || dataKeys.length > 1) && (
                            <Legend onClick={handleLegendClick} iconType="circle" wrapperStyle={{ cursor: 'pointer', fontSize: '12px', color: '#64748b', paddingTop: '10px' }} />
                        )}
                        {dataKeys.map((key, index) => (
                            <Bar key={key} dataKey={key} fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} hide={hiddenSeries[key]} barSize={isCompact ? 16 : 32} />
                        ))}
                    </BarChart>
                );

            case "line":
                return (
                    <LineChart data={safeData} margin={chartMargin}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="label" stroke="#94a3b8" fontSize={isCompact ? 10 : 12} tickLine={false} axisLine={false} tickMargin={8} />
                        {!isCompact && (
                            <YAxis
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickMargin={4}
                                tickFormatter={formatYAxis}
                                domain={smartYAxis ? ['auto', 'auto'] : [0, 'auto']}
                            />
                        )}
                        <Tooltip content={<CustomTooltip />} />
                        {(!isCompact || dataKeys.length > 1) && (
                            <Legend onClick={handleLegendClick} iconType="circle" wrapperStyle={{ cursor: 'pointer', fontSize: '12px', color: '#64748b', paddingTop: '10px' }} />
                        )}
                        {dataKeys.map((key, index) => (
                            <Line key={key} type="monotone" dataKey={key} stroke={COLORS[index % COLORS.length]} strokeWidth={2.5} dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: COLORS[index % COLORS.length] }} hide={hiddenSeries[key]} />
                        ))}
                    </LineChart>
                );

                case "pie": {
                    const latestData = safeData[safeData.length - 1];
                    const pieData = dataKeys
                        .filter(key => !hiddenSeries[key])
                        .map((key, index) => ({
                            name: key,
                            value: Number(latestData[key]) || 0,
                            color: COLORS[index % COLORS.length]
                        }));
    
                    return (
                        <PieChart margin={chartMargin}>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                outerRadius={isCompact ? "80%" : "90%"}
                                dataKey="value"
                                stroke="#ffffff"
                                strokeWidth={2}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            {(!isCompact || dataKeys.length > 1) && (
                                <Legend 
                                    onClick={handleLegendClick} 
                                    iconType="circle" 
                                    wrapperStyle={{ cursor: 'pointer', fontSize: '12px', color: '#64748b', paddingTop: '10px' }} 
                                />
                            )}
                        </PieChart>
                    );
                }
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