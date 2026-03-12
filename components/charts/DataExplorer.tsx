"use client";

import { useState, useEffect } from "react";
import ChartRenderer from "./ChartRenderer";
import { FiAlertCircle } from "react-icons/fi";
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
            <div className="w-full py-8 text-center text-amber-700 my-8">
                <FiAlertCircle className="w-6 h-6 mb-2 mx-auto opacity-50" />
                <p className="font-bold text-sm">Incomplete Data Configuration</p>
                <p className="text-xs mt-1 opacity-70">Select an Indicator and Country in the CMS.</p>
            </div>
        );
    }

    if (isBootstrapping) {
        return <div className="w-full h-80 animate-pulse bg-slate-50/50 my-12" />;
    }

    return (
        <div className="flex flex-col my-12 w-full">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-6">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
                        {indicatorLabel}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        {countryName}
                    </p>
                </div>

                {/* Raw Typography Controls */}
                <div className="flex items-center gap-4 text-xs sm:text-sm font-medium text-slate-400 overflow-x-auto scrollbar-hide">
                    
                    {(chartType === 'line' || chartType === 'bar') && (
                        <button
                            onClick={() => setIsSmartY(!isSmartY)}
                            className={`transition-colors outline-none whitespace-nowrap ${isSmartY ? "text-emerald-600" : "hover:text-slate-800"}`}
                        >
                            Auto-Scale {isSmartY ? "On" : "Off"}
                        </button>
                    )}

                    <div className="flex items-center gap-1">
                        <input
                            type="text"
                            inputMode="numeric"
                            value={startYear}
                            onChange={(e) => setStartYear(e.target.value)}
                            className="w-10 bg-transparent text-slate-800 text-center outline-none border-b border-transparent focus:border-emerald-500 transition-colors"
                            maxLength={4}
                        />
                        <span>-</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={endYear}
                            onChange={(e) => setEndYear(e.target.value)}
                            className="w-10 bg-transparent text-slate-800 text-center outline-none border-b border-transparent focus:border-emerald-500 transition-colors"
                            maxLength={4}
                        />
                    </div>

                    <select
                        className="bg-transparent text-slate-800 outline-none cursor-pointer appearance-none pr-2"
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value as any)}
                    >
                        <option value="line">Line</option>
                        <option value="bar">Bar</option>
                        <option value="pie">Pie</option>
                        <option value="doughnut">Ring</option>
                    </select>

                </div>
            </div>

            <div className="h-72 sm:h-96 w-full relative">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : error ? (
                    <div className="w-full h-full flex items-center justify-center text-center">
                        <span className="text-xs text-red-500">{error}</span>
                    </div>
                ) : null}
                
                <ChartRenderer type={chartType} data={chartData} isCompact={false} smartYAxis={isSmartY} />
            </div>

            <div className="mt-4 flex justify-between items-center text-[10px] sm:text-xs font-medium text-slate-400">
                <span className="uppercase tracking-widest">{provider.name}</span>
                <span className="hidden sm:inline">Hover for exact values</span>
                <span className="inline sm:hidden">Tap for exact values</span>
            </div>
        </div>
    );
}