"use client";

import { useState, useEffect, useRef } from "react";
import ChartRenderer from "./ChartRenderer";
import {
    FiActivity, FiBarChart2, FiPieChart,
    FiMaximize, FiCalendar, FiPlus, FiX, FiSearch, FiAlertCircle,
} from "react-icons/fi";

// Must stay in sync with ChartRenderer's COLORS array
const SERIES_COLORS = ["#10b981", "#6366f1", "#f43f5e", "#f59e0b", "#8b5cf6", "#0ea5e9", "#64748b"];

interface Country { code: string; name: string }

interface DataExplorerProps {
    indicator: string;
    countries?: { countryCode: string }[];
    countryCode?: string;
    startYear?: string;
    endYear?: string;
    defaultChartType?: "line" | "bar" | "pie";
    smartYAxis?: boolean;
}

export default function DataExplorer({
    indicator,
    countries: initialCountries,
    countryCode,
    startYear: initialStart = "2000",
    endYear: initialEnd = new Date().getFullYear().toString(),
    defaultChartType = "line",
    smartYAxis = true,
}: DataExplorerProps) {

    const resolveInitialCodes = (): string[] => {
        if (initialCountries?.length) return initialCountries.map(c => c.countryCode);
        if (countryCode) return [countryCode];
        return ["WLD"];
    };

    const [activeCodes, setActiveCodes] = useState<string[]>(resolveInitialCodes);
    const [allCountries, setAllCountries] = useState<Country[]>([]);
    const [nameMap, setNameMap] = useState<Record<string, string>>({});
    const [showPicker, setShowPicker] = useState(false);
    const [search, setSearch] = useState("");
    const pickerRef = useRef<HTMLDivElement>(null);

    // Per-session series cache keyed by `code|indicator|start|end`
    const cache = useRef<Record<string, any>>({});

    const [indicatorLabel, setIndicatorLabel] = useState("");
    const [startYear, setStartYear] = useState(initialStart);
    const [endYear, setEndYear] = useState(initialEnd);
    const [chartType, setChartType] = useState<"line" | "bar" | "pie">(
        defaultChartType === "doughnut" ? "line" : defaultChartType
    );
    const [isSmartY, setIsSmartY] = useState(smartYAxis);

    const [chartData, setChartData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Load countries list once
    useEffect(() => {
        fetch("/api/worldbank/countries")
            .then(r => r.json())
            .then((list: Country[]) => {
                if (!Array.isArray(list)) return;
                setAllCountries(list);
                const map: Record<string, string> = {};
                list.forEach(c => { map[c.code] = c.name; });
                setNameMap(map);
            })
            .catch(console.error);
    }, []);

    // Close picker on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
                setShowPicker(false);
                setSearch("");
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Invalidate cache when date range changes
    useEffect(() => { cache.current = {}; }, [startYear, endYear, indicator]);

    // Fetch only the series not already cached
    useEffect(() => {
        if (!indicator || activeCodes.length === 0) return;

        const fetchAll = async () => {
            const uncached = activeCodes.filter(code => !cache.current[`${code}|${indicator}|${startYear}|${endYear}`]);

            if (uncached.length > 0) setIsLoading(true);
            setError("");

            try {
                await Promise.all(
                    uncached.map(async code => {
                        const params = new URLSearchParams({ indicator, country: code, start: startYear, end: endYear });
                        const res = await fetch(`/api/worldbank?${params}`);
                        if (!res.ok) return;
                        const json = await res.json();
                        if (json?.data?.length) {
                            cache.current[`${code}|${indicator}|${startYear}|${endYear}`] = json;
                        }
                    })
                );

                let label = "";
                const dataMap: Record<string, any> = {};

                activeCodes.forEach(code => {
                    const json = cache.current[`${code}|${indicator}|${startYear}|${endYear}`];
                    if (!json?.data?.length) return;
                    if (!label) label = json.indicatorLabel || "";
                    const seriesName = json.countryName || code;
                    json.data.forEach((point: any) => {
                        if (!dataMap[point.label]) dataMap[point.label] = { label: point.label };
                        const value = Object.entries(point).find(([k]) => k !== "label")?.[1];
                        if (value !== undefined) dataMap[point.label][seriesName] = value;
                    });
                });

                const merged = Object.values(dataMap).sort((a, b) => parseInt(a.label) - parseInt(b.label));
                if (merged.length === 0 && uncached.length > 0) setError("No data found for this period.");
                setChartData(merged);
                if (label) setIndicatorLabel(label);
            } catch (err: any) {
                setError(err.message || "Failed to load data.");
            } finally {
                setIsLoading(false);
            }
        };

        const t = setTimeout(fetchAll, 300);
        return () => clearTimeout(t);
    }, [indicator, activeCodes, startYear, endYear]);

    const addCountry = (code: string) => {
        if (!activeCodes.includes(code)) setActiveCodes(prev => [...prev, code]);
        setShowPicker(false);
        setSearch("");
    };

    const removeCountry = (code: string) => {
        if (activeCodes.length > 1) setActiveCodes(prev => prev.filter(c => c !== code));
    };

    const filtered = allCountries.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) && !activeCodes.includes(c.code)
    );

    if (!indicator) {
        return (
            <div className="w-full py-12 text-center text-amber-700 bg-amber-50 rounded-2xl border border-amber-100 my-8">
                <FiAlertCircle className="w-8 h-8 mb-3 mx-auto opacity-70" />
                <p className="font-bold">Incomplete Configuration</p>
                <p className="text-sm mt-1 opacity-80">Select an indicator in the CMS.</p>
            </div>
        );
    }

    return (
        <div className="my-12 w-full">
            {/* Header row */}
            <div className="flex flex-col gap-4 mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                    {indicatorLabel || indicator}
                </h3>

                {/* Country chips + picker */}
                <div className="flex flex-wrap items-center gap-2">
                    {activeCodes.map((code, i) => {
                        const color = SERIES_COLORS[i % SERIES_COLORS.length];
                        return (
                            <span
                                key={code}
                                className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full text-sm font-semibold border transition-all"
                                style={{
                                    color,
                                    borderColor: `${color}40`,
                                    backgroundColor: `${color}12`,
                                }}
                            >
                                {nameMap[code] || code}
                                {activeCodes.length > 1 && (
                                    <button
                                        onClick={() => removeCountry(code)}
                                        className="opacity-50 hover:opacity-100 transition-opacity rounded-full"
                                        aria-label={`Remove ${nameMap[code] || code}`}
                                    >
                                        <FiX className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </span>
                        );
                    })}

                    <div className="relative" ref={pickerRef}>
                        <button
                            onClick={() => setShowPicker(v => !v)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-dashed border-slate-300 text-slate-400 hover:border-emerald-400 hover:text-emerald-600 text-sm font-semibold transition-all"
                        >
                            <FiPlus className="w-3.5 h-3.5" />
                            Add country
                        </button>

                        {showPicker && (
                            <div className="absolute top-full mt-2 left-0 z-30 bg-white rounded-2xl shadow-xl border border-slate-100 w-64 p-2">
                                <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl mb-2">
                                    <FiSearch className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <input
                                        autoFocus
                                        type="text"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Search countries…"
                                        className="text-sm outline-none w-full bg-transparent text-slate-700 placeholder:text-slate-400"
                                    />
                                </div>
                                <ul className="max-h-52 overflow-y-auto">
                                    {filtered.slice(0, 60).map(c => (
                                        <li key={c.code}>
                                            <button
                                                onClick={() => addCountry(c.code)}
                                                className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors flex items-center justify-between"
                                            >
                                                <span className="font-medium">{c.name}</span>
                                                <span className="text-slate-400 text-xs ml-2">{c.code}</span>
                                            </button>
                                        </li>
                                    ))}
                                    {filtered.length === 0 && (
                                        <li className="px-3 py-3 text-sm text-slate-400 text-center">No results</li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Controls row */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                    {/* Chart type */}
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
                        {([
                            { id: "line", icon: FiActivity, label: "Line" },
                            { id: "bar", icon: FiBarChart2, label: "Bar" },
                            { id: "pie", icon: FiPieChart, label: "Pie" },
                        ] as const).map(t => (
                            <button
                                key={t.id}
                                onClick={() => setChartType(t.id)}
                                title={t.label}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                    chartType === t.id
                                        ? "bg-white text-emerald-600 shadow-sm"
                                        : "text-slate-500 hover:text-slate-800"
                                }`}
                            >
                                <t.icon className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{t.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Date range */}
                    <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg text-sm">
                        <FiCalendar className="w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="text" inputMode="numeric" value={startYear}
                            onChange={e => setStartYear(e.target.value)}
                            className="w-11 bg-transparent text-slate-800 font-semibold text-center outline-none text-xs"
                            maxLength={4}
                        />
                        <span className="text-slate-300">–</span>
                        <input
                            type="text" inputMode="numeric" value={endYear}
                            onChange={e => setEndYear(e.target.value)}
                            className="w-11 bg-transparent text-slate-800 font-semibold text-center outline-none text-xs"
                            maxLength={4}
                        />
                    </div>

                    {/* Auto-scale */}
                    {(chartType === "line" || chartType === "bar") && (
                        <button
                            onClick={() => setIsSmartY(v => !v)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                isSmartY
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                    : "bg-white border-slate-200 text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            <FiMaximize className="w-3.5 h-3.5" />
                            Auto-scale
                        </button>
                    )}
                </div>
            </div>

            {/* Chart */}
            <div className="relative bg-slate-50/60 rounded-2xl p-3 sm:p-5" style={{ height: 380 }}>
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-10 rounded-2xl">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs font-semibold text-emerald-700">Loading…</span>
                        </div>
                    </div>
                )}
                {!isLoading && error && (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center">
                        <FiAlertCircle className="w-5 h-5 text-red-400 mb-2" />
                        <span className="text-sm text-red-500 font-medium">{error}</span>
                    </div>
                )}
                <ChartRenderer type={chartType} data={chartData} isCompact={false} smartYAxis={isSmartY} />
            </div>

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    World Bank Open Data
                </span>
                <span>Hover data points for exact values</span>
            </div>
        </div>
    );
}
