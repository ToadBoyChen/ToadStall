"use client";

import { useState, useEffect, useRef } from "react";
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

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

export default function ChartRenderer({ type, data, isCompact = false }: { type: string; data: any[], isCompact?: boolean }) {
    const [isInView, setIsInView] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const currentRef = containerRef.current;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    if (currentRef) observer.unobserve(currentRef);
                }
            },
            { rootMargin: "50px", threshold: 0.1 }
        );

        if (currentRef) observer.observe(currentRef);
        return () => { if (currentRef) observer.unobserve(currentRef); };
    }, []);

    if (!data || data.length === 0) return <p className="text-slate-500 text-center">No data available</p>;

    const dataKeys = Object.keys(data[0]).filter(
        (key) => key !== "label" && key !== "_key" && key !== "_type"
    );

    const handleLegendClick = (e: any) => {
        const { dataKey } = e;
        setHiddenSeries((prev) => ({
            ...prev,
            [dataKey]: !prev[dataKey],
        }));
    };

    const chartMargin = isCompact
        ? { top: 10, right: 10, left: -20, bottom: 0 }
        : { top: 20, right: 20, left: -20, bottom: 0 };

    const renderChart = () => {
        switch (type) {
            case "bar":
                return (
                    <BarChart data={data} margin={chartMargin}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="label" stroke="#64748b" fontSize={isCompact ? 10 : 12} tickLine={false} axisLine={false} />
                        {!isCompact && <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />}
                        <Tooltip
                            cursor={{ fill: '#f1f5f9' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        {(!isCompact || dataKeys.length > 1) && (
                            <Legend onClick={handleLegendClick} wrapperStyle={{ cursor: 'pointer', fontSize: '12px' }} />
                        )}
                        {dataKeys.map((key, index) => (
                            <Bar
                                key={key}
                                dataKey={key}
                                fill={COLORS[index % COLORS.length]}
                                radius={[4, 4, 0, 0]}
                                hide={hiddenSeries[key]}
                            />
                        ))}
                    </BarChart>
                );

            case "line":
                return (
                    <LineChart data={data} margin={chartMargin}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="label" stroke="#64748b" fontSize={isCompact ? 10 : 12} tickLine={false} axisLine={false} />
                        {!isCompact && <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />}
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        {(!isCompact || dataKeys.length > 1) && (
                            <Legend onClick={handleLegendClick} wrapperStyle={{ cursor: 'pointer', fontSize: '12px', paddingTop: '10px' }} iconType="circle" />
                        )}
                        {dataKeys.map((key, index) => (
                            <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stroke={COLORS[index % COLORS.length]}
                                strokeWidth={3}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                                hide={hiddenSeries[key]}
                            />
                        ))}
                    </LineChart>
                );

            case "pie":
            case "doughnut":
                const pieDataKey = dataKeys[0] || "value";
                return (
                    <PieChart>
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Pie
                            data={data}
                            innerRadius={type === "doughnut" ? (isCompact ? 40 : 60) : 0}
                            outerRadius={isCompact ? 60 : 100}
                            paddingAngle={type === "doughnut" ? 5 : 0}
                            dataKey={pieDataKey}
                            nameKey="label"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                );

            default:
                return <p className="text-slate-500 text-center">Unsupported chart type: {type}</p>;
        }
    };

    return (
        <div ref={containerRef} className="w-full h-full min-h-30">
            {isInView ? (
                <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                </ResponsiveContainer>
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-xl animate-pulse">
                    <span className="text-slate-400 text-sm font-medium tracking-widest uppercase">Loading Chart...</span>
                </div>
            )}
        </div>
    );
}