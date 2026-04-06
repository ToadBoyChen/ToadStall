'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ChartRenderer from '@/components/charts/ChartRenderer';
import indicators from '@/lib/worldBankIndicators.json';
import {
    FiActivity, FiBarChart2, FiPieChart,
    FiPlus, FiX, FiSearch, FiCalendar, FiMaximize,
} from 'react-icons/fi';

const SERIES_COLORS = ['#10b981', '#6366f1', '#f43f5e', '#f59e0b', '#8b5cf6', '#0ea5e9', '#64748b'];

interface Country { code: string; name: string; }

export interface ChartConfig {
    indicator: string;
    countries: string[];
    startYear: string;
    endYear: string;
    chartType: 'line' | 'bar' | 'pie';
    smartYAxis: boolean;
}

interface PostChartBuilderProps {
    onConfigChange: (config: ChartConfig | null) => void;
}

export default function PostChartBuilder({ onConfigChange }: PostChartBuilderProps) {
    const currentYear = new Date().getFullYear().toString();

    const [indicator, setIndicator] = useState('');
    const [countries, setCountries] = useState<string[]>(['WLD']);
    const [startYear, setStartYear] = useState('2000');
    const [endYear, setEndYear] = useState(currentYear);
    const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');
    const [smartYAxis, setSmartYAxis] = useState(true);

    const [allCountries, setAllCountries] = useState<Country[]>([]);
    const [nameMap, setNameMap] = useState<Record<string, string>>({});
    const [showPicker, setShowPicker] = useState(false);
    const [search, setSearch] = useState('');
    const pickerRef = useRef<HTMLDivElement>(null);

    const [chartData, setChartData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState('');
    const cache = useRef<Record<string, any>>({});

    // Load countries once
    useEffect(() => {
        fetch('/api/worldbank/countries')
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

    // Close country picker on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
                setShowPicker(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Invalidate cache when dates or indicator change
    useEffect(() => { cache.current = {}; }, [startYear, endYear, indicator]);

    // Fetch chart data
    useEffect(() => {
        if (!indicator || countries.length === 0) {
            setChartData([]);
            return;
        }

        const fetchAll = async () => {
            const uncached = countries.filter(
                code => !cache.current[`${code}|${indicator}|${startYear}|${endYear}`]
            );
            if (uncached.length > 0) setIsLoading(true);
            setFetchError('');

            try {
                await Promise.all(uncached.map(async code => {
                    const params = new URLSearchParams({ indicator, country: code, start: startYear, end: endYear });
                    const res = await fetch(`/api/worldbank?${params}`);
                    if (!res.ok) return;
                    const json = await res.json();
                    if (json?.data?.length) {
                        cache.current[`${code}|${indicator}|${startYear}|${endYear}`] = json;
                    }
                }));

                const dataMap: Record<string, any> = {};
                countries.forEach(code => {
                    const json = cache.current[`${code}|${indicator}|${startYear}|${endYear}`];
                    if (!json?.data?.length) return;
                    const seriesName = json.countryName || code;
                    json.data.forEach((point: any) => {
                        if (!dataMap[point.label]) dataMap[point.label] = { label: point.label };
                        const value = Object.entries(point).find(([k]) => k !== 'label')?.[1];
                        if (value !== undefined) dataMap[point.label][seriesName] = value;
                    });
                });

                const merged = Object.values(dataMap).sort((a, b) => parseInt(a.label) - parseInt(b.label));
                if (merged.length === 0 && uncached.length > 0) setFetchError('No data found for this period.');
                setChartData(merged);
            } catch (err: any) {
                setFetchError(err.message || 'Failed to load data.');
            } finally {
                setIsLoading(false);
            }
        };

        const t = setTimeout(fetchAll, 300);
        return () => clearTimeout(t);
    }, [indicator, countries, startYear, endYear]);

    // Sync config up to parent
    useEffect(() => {
        if (!indicator) {
            onConfigChange(null);
            return;
        }
        onConfigChange({ indicator, countries, startYear, endYear, chartType, smartYAxis });
    }, [indicator, countries, startYear, endYear, chartType, smartYAxis, onConfigChange]);

    const addCountry = (code: string) => {
        if (!countries.includes(code)) setCountries(prev => [...prev, code]);
        setShowPicker(false);
        setSearch('');
    };

    const removeCountry = (code: string) => {
        if (countries.length > 1) setCountries(prev => prev.filter(c => c !== code));
    };

    const filtered = allCountries.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) && !countries.includes(c.code)
    );

    return (
        <div className="space-y-5">
            {/* Indicator selector */}
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    World Bank Indicator
                </label>
                <select
                    value={indicator}
                    onChange={e => setIndicator(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all cursor-pointer"
                >
                    <option value="">Select an indicator…</option>
                    {indicators.map(ind => (
                        <option key={ind.id} value={ind.id}>{ind.label}</option>
                    ))}
                </select>
            </div>

            {indicator && (
                <>
                    {/* Country chips + controls */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Country chips */}
                        {countries.map((code, i) => {
                            const color = SERIES_COLORS[i % SERIES_COLORS.length];
                            return (
                                <span
                                    key={code}
                                    className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full text-sm font-semibold border"
                                    style={{ color, borderColor: `${color}40`, backgroundColor: `${color}12` }}
                                >
                                    {nameMap[code] || code}
                                    {countries.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeCountry(code)}
                                            className="opacity-50 hover:opacity-100 transition-opacity rounded-full"
                                        >
                                            <FiX className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </span>
                            );
                        })}

                        {/* Country picker */}
                        <div className="relative" ref={pickerRef}>
                            <button
                                type="button"
                                onClick={() => setShowPicker(v => !v)}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-dashed border-slate-300 text-slate-400 hover:border-emerald-400 hover:text-emerald-600 text-sm font-semibold transition-all"
                            >
                                <FiPlus className="w-3.5 h-3.5" /> Country
                            </button>
                            {showPicker && (
                                <div className="absolute top-full mt-2 left-0 z-40 bg-white rounded-2xl shadow-xl border border-slate-100 w-64 p-2">
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
                                                    type="button"
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

                        {/* Divider */}
                        <span className="text-slate-200 select-none">|</span>

                        {/* Chart type */}
                        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
                            {([
                                { id: 'line', icon: FiActivity, label: 'Line' },
                                { id: 'bar', icon: FiBarChart2, label: 'Bar' },
                                { id: 'pie', icon: FiPieChart, label: 'Pie' },
                            ] as const).map(t => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setChartType(t.id)}
                                    title={t.label}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                        chartType === t.id
                                            ? 'bg-white text-emerald-600 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    <t.icon className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">{t.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Date range */}
                        <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                            <FiCalendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <input
                                type="text"
                                inputMode="numeric"
                                value={startYear}
                                onChange={e => setStartYear(e.target.value)}
                                className="w-11 bg-transparent text-slate-800 font-semibold text-center outline-none text-xs"
                                maxLength={4}
                            />
                            <span className="text-slate-300">–</span>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={endYear}
                                onChange={e => setEndYear(e.target.value)}
                                className="w-11 bg-transparent text-slate-800 font-semibold text-center outline-none text-xs"
                                maxLength={4}
                            />
                        </div>

                        {/* Auto-scale */}
                        {(chartType === 'line' || chartType === 'bar') && (
                            <button
                                type="button"
                                onClick={() => setSmartYAxis(v => !v)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                    smartYAxis
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                        : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <FiMaximize className="w-3.5 h-3.5" />
                                Auto-scale
                            </button>
                        )}
                    </div>

                    {/* Live preview */}
                    <div className="relative bg-slate-50/60 rounded-2xl p-3 sm:p-5 border border-slate-100" style={{ height: 300 }}>
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-10 rounded-2xl">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-xs font-semibold text-emerald-700">Loading…</span>
                                </div>
                            </div>
                        )}
                        {!isLoading && fetchError && (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-sm text-red-500 font-medium">{fetchError}</span>
                            </div>
                        )}
                        {!isLoading && !fetchError && chartData.length === 0 && (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-sm text-slate-400">Chart preview will appear here…</span>
                            </div>
                        )}
                        <ChartRenderer type={chartType} data={chartData} isCompact={false} smartYAxis={smartYAxis} />
                    </div>

                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        Live data from World Bank Open Data — readers can interact with the chart
                    </p>
                </>
            )}
        </div>
    );
}
