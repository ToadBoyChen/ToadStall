"use client";

import { useState, useEffect } from "react";
import ChartRenderer from "./ChartRenderer";
import {
    FiAlertCircle,
    FiActivity,
    FiBarChart2,
    FiPieChart,
    FiCircle,
    FiMaximize,
    FiCalendar
} from "react-icons/fi";
import { DataProvider, WorldBankProvider } from "@/lib/dataProviders";

interface DataExplorerProps {
    provider?: DataProvider;
    indicator: string;
    countryCode: string;
    startYear?: string;
    endYear?: string;
    defaultChartType?: 'line' | 'bar' | 'pie' | 'doughnut';
    smartYAxis?: boolean;
}

export default function DataExplorer({
    provider = WorldBankProvider,
    indicator,
    countryCode,
    startYear: initialStart = '2000',
    endYear: initialEnd = new Date().getFullYear().toString(),
    defaultChartType = 'line',
    smartYAxis = true
}: DataExplorerProps) {

    const [startYear, setStartYear] = useState(initialStart);
    const [endYear, setEndYear] = useState(initialEnd);
    const [chartType, setChartType] = useState(defaultChartType);
    const [isSmartY, setIsSmartY] = useState(smartYAxis);

    const [indicatorLabel, setIndicatorLabel] = useState("Loading...");
    const [countryName, setCountryName] = useState("Loading...");
    const [isBootstrapping, setIsBootstrapping] = useState(true);

    const [chartData, setChartData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        setIsSmartY(smartYAxis);
    }, [smartYAxis]);

    useEffect(() => {
        if (!indicator || !countryCode) return;

        const loadLabels = async () => {
            try {
                const [indicators, countries] = await Promise.all([
                    provider.getIndicators(),
                    provider.getCountries()
                ]);

                const foundInd = indicators.find(i => i.id === indicator);
                const foundCountry = countries.find(c => c.code === countryCode);

                setIndicatorLabel(foundInd?.label || indicator);
                setCountryName(foundCountry?.name || countryCode);
            } catch (err) {
                console.error("Failed to load labels", err);
                setIndicatorLabel(indicator);
                setCountryName(countryCode);
            } finally {
                setIsBootstrapping(false);
            }
        };
        loadLabels();
    }, [provider, indicator, countryCode]);

    useEffect(() => {
        if (isBootstrapping || !indicator || !countryCode) return;

        const fetchData = async () => {
            setIsLoading(true);
            setError("");

            try {
                const data = await provider.fetchData(
                    indicator,
                    indicatorLabel !== "Loading..." ? indicatorLabel : indicator,
                    countryCode,
                    startYear,
                    endYear
                );

                if (data.length === 0) setError(`No records found for this period.`);
                setChartData(data);
            } catch (err: any) {
                setError(err.message || "Failed to load data.");
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(() => { fetchData(); }, 500);
        return () => clearTimeout(timeoutId);
    }, [indicator, indicatorLabel, countryCode, startYear, endYear, isBootstrapping, provider]);

    if (!indicator || !countryCode) {
        return (
            <div className="w-full py-12 text-center text-amber-700 bg-amber-50 rounded-2xl border border-amber-100 my-8">
                <FiAlertCircle className="w-8 h-8 mb-3 mx-auto opacity-70" />
                <p className="font-bold text-base">Incomplete Data Configuration</p>
                <p className="text-sm mt-1 opacity-80">Please select an Indicator and Country in the CMS.</p>
            </div>
        );
    }

    if (isBootstrapping) {
        return <div className="w-full h-96 animate-pulse bg-slate-100 rounded-3xl my-12" />;
    }

    return (
        <div className="flex flex-col my-12 w-full bg-white rounded-3xl border border-slate-100 shadow-sm p-4 sm:p-8">

            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8">
                <div className="flex-1">
                    <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">
                        {indicatorLabel}
                    </h3>
                    <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                        {countryName}
                    </div>
                </div>

                {/* Modernized Controls Toolbar */}
                <div className="flex flex-wrap items-center gap-3 xl:justify-end">

                    {/* Chart Type Segmented Control */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                        {[
                            { id: 'line', icon: FiActivity, label: 'Line' },
                            { id: 'bar', icon: FiBarChart2, label: 'Bar' },
                            { id: 'pie', icon: FiPieChart, label: 'Pie' },
                            { id: 'doughnut', icon: FiCircle, label: 'Ring' }
                        ].map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setChartType(type.id as any)}
                                title={type.label}
                                className={`flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-lg transition-all duration-200 ${chartType === type.id
                                        ? "bg-white text-emerald-600 shadow-sm font-medium"
                                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                                    }`}
                            >
                                <type.icon className="w-4 h-4 sm:mr-1.5" />
                                <span className="hidden sm:inline text-xs">{type.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Date Range Inputs */}
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl border border-transparent focus-within:border-emerald-200 focus-within:ring-2 focus-within:ring-emerald-50 transition-all">
                        <FiCalendar className="w-4 h-4 text-slate-400 hidden sm:block" />
                        <input
                            type="text"
                            inputMode="numeric"
                            value={startYear}
                            onChange={(e) => setStartYear(e.target.value)}
                            className="w-12 bg-transparent text-slate-800 font-medium text-center outline-none text-sm"
                            maxLength={4}
                        />
                        <span className="text-slate-300 font-medium">-</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={endYear}
                            onChange={(e) => setEndYear(e.target.value)}
                            className="w-12 bg-transparent text-slate-800 font-medium text-center outline-none text-sm"
                            maxLength={4}
                        />
                    </div>

                    {/* Auto-Scale Toggle */}
                    {(chartType === 'line' || chartType === 'bar') && (
                        <button
                            onClick={() => setIsSmartY(!isSmartY)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 text-sm font-medium ${isSmartY
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800"
                                }`}
                        >
                            <FiMaximize className={`w-4 h-4 ${isSmartY ? "text-emerald-500" : "text-slate-400"}`} />
                            <span className="hidden sm:inline">Auto-Scale</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Chart Area */}
            <div className="h-75 sm:h-100 w-full relative bg-slate-50/50 rounded-2xl p-2 sm:p-4">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-10 rounded-2xl">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm font-medium text-emerald-700">Fetching data...</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center bg-red-50/50 rounded-2xl border border-red-100">
                        <FiAlertCircle className="w-6 h-6 text-red-400 mb-2" />
                        <span className="text-sm text-red-600 font-medium">{error}</span>
                    </div>
                ) : null}

                <ChartRenderer type={chartType} data={chartData} isCompact={false} smartYAxis={isSmartY} />
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-between items-center text-[11px] sm:text-xs font-semibold text-slate-400 pt-4 border-t border-slate-100">
                <span className="uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    {provider.name}
                </span>
                <span className="hidden sm:inline bg-slate-100 px-2 py-1 rounded-md">Hover data points for exact values</span>
                <span className="inline sm:hidden bg-slate-100 px-2 py-1 rounded-md">Tap data points for values</span>
            </div>
        </div>
    );
}