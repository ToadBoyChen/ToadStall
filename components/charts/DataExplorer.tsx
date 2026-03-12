"use client";

import { useState, useEffect } from "react";
import ChartRenderer from "./ChartRenderer";
import { FiFilter, FiAlertCircle, FiPieChart, FiTrendingUp, FiDatabase } from "react-icons/fi";
import { DataProvider, WorldBankProvider } from "@/lib/dataProviders";

interface DataExplorerProps {
    provider?: DataProvider;
    indicator: string;     // Passed from CMS
    countryCode: string;   // Passed from CMS
    startYear?: string;
    endYear?: string;
    defaultChartType?: 'line' | 'bar' | 'pie' | 'doughnut';
}

export default function DataExplorer({
    provider = WorldBankProvider, // Defaults to World Bank, but can be swapped!
    indicator,
    countryCode,
    startYear: initialStart = '2000',
    endYear: initialEnd = new Date().getFullYear().toString(),
    defaultChartType = 'line'
}: DataExplorerProps) {

    // User Controls
    const [startYear, setStartYear] = useState(initialStart);
    const [endYear, setEndYear] = useState(initialEnd);
    const [chartType, setChartType] = useState(defaultChartType);

    // Bootstrapping State (Getting names for the specific codes)
    const [indicatorLabel, setIndicatorLabel] = useState("Loading...");
    const [countryName, setCountryName] = useState("Loading...");
    const [isBootstrapping, setIsBootstrapping] = useState(true);

    // Chart Data State
    const [chartData, setChartData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // 1. Bootstrap: Ask the provider for the human-readable names of our locked variables
    useEffect(() => {
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

    // 2. Fetch Data when timeline changes
    useEffect(() => {
        if (isBootstrapping) return;

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

                if (data.length === 0) {
                    setError(`No records found between ${startYear}-${endYear}.`);
                }
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

    if (isBootstrapping) {
        return <div className="w-full h-96 bg-slate-50 rounded-3xl animate-pulse my-10" />;
    }

    return (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-slate-100 my-10">
            
            {/* Header: Source Badge & Dynamic Titles */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <FiTrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-slate-800 leading-tight">{indicatorLabel}</h4>
                        <p className="text-sm font-medium text-slate-500">{countryName}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 w-fit rounded-full text-xs font-bold tracking-widest uppercase self-start">
                    <FiDatabase />
                    <span>Source: {provider.name}</span>
                </div>
            </div>

            {/* Control Bar: Timeline & Chart Type Only */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 bg-slate-50 p-4 rounded-2xl items-center flex-wrap justify-between">
                
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
                    <div className="flex items-center gap-2 text-slate-500 font-bold px-2">
                        <FiFilter className="w-4 h-4" />
                        <span className="uppercase tracking-widest text-xs">Timeline</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={startYear}
                            onChange={(e) => setStartYear(e.target.value)}
                            className="w-20 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl px-2 py-2 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                        <span className="text-slate-400 font-medium text-sm">to</span>
                        <input
                            type="number"
                            value={endYear}
                            onChange={(e) => setEndYear(e.target.value)}
                            className="w-20 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl px-2 py-2 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-200 justify-end">
                    <FiPieChart className="w-4 h-4 text-slate-400 hidden sm:block" />
                    <select
                        className="bg-white border border-slate-200 text-slate-700 font-medium rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value as any)}
                    >
                        <option value="line">Line Chart</option>
                        <option value="bar">Bar Chart</option>
                        <option value="pie">Pie Chart</option>
                        <option value="doughnut">Doughnut Chart</option>
                    </select>
                </div>
            </div>

            {/* Chart Area */}
            <div className="w-full h-96 relative">
                {isLoading ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl animate-pulse">
                        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    </div>
                ) : error ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-red-50/80 rounded-2xl px-6 py-4 border border-red-100 overflow-auto text-center">
                        <FiAlertCircle className="w-8 h-8 mb-3 text-red-500" />
                        <p className="font-bold text-red-700 mb-2">Notice</p>
                        <code className="text-xs text-red-600 bg-white p-3 rounded-lg shadow-sm border border-red-100 inline-block">
                            {error}
                        </code>
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 rounded-2xl text-slate-500 px-6 text-center">
                        <p className="font-bold">No data to display.</p>
                    </div>
                ) : (
                    <ChartRenderer type={chartType} data={chartData} isCompact={false} />
                )}
            </div>
        </div>
    );
}