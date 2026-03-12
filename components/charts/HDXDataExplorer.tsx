"use client";

import { useState, useEffect } from "react";
import ChartRenderer from "./ChartRenderer";
import { FiFilter, FiAlertCircle } from "react-icons/fi";
import { getHDXData } from "@/lib/actions"; // <-- Imported the server action here!

const HDX_CONFIG = [
    { id: "idps", label: "Internally Displaced Persons", endpoint: "/api/v2/affected-people/idps", valueKey: "population" },
    { id: "refugees", label: "Refugees & Migration", endpoint: "/api/v2/affected-people/refugees", valueKey: "population" },
    { id: "returnees", label: "Returnees", endpoint: "/api/v2/affected-people/returnees", valueKey: "population" },
    { id: "conflict", label: "Conflict Events", endpoint: "/api/v2/coordination-context/conflict-events", valueKey: "events" },
    { id: "food-prices", label: "Food Prices", endpoint: "/api/v2/food-security-nutrition-poverty/food-prices-market-monitor", valueKey: "price" },
    { id: "food-security", label: "Food Security", endpoint: "/api/v2/food-security-nutrition-poverty/food-security", valueKey: "population_in_phase" },
    { id: "poverty", label: "Poverty Rate", endpoint: "/api/v2/food-security-nutrition-poverty/poverty-rate", valueKey: "poverty_rate" },
    { id: "population", label: "Baseline Population", endpoint: "/api/v2/affected-people/baseline-population", valueKey: "population" },
];

const COUNTRIES = [
  { code: "AFG", name: "Afghanistan" },
  { code: "COD", name: "Democratic Republic of the Congo" },
  { code: "MLI", name: "Mali" },
  { code: "SOM", name: "Somalia" },
  { code: "SDN", name: "Sudan" },
  { code: "SYR", name: "Syria" },
  { code: "UKR", name: "Ukraine" },
  { code: "YEM", name: "Yemen" },
  { code: "GBR", name: "United Kingdom" }
];

interface HDXDataExplorerProps {
  displayMode?: 'general' | 'guided';
  defaultIndicator?: string;
  defaultCountryCode?: string;
  defaultStartYear?: string;
  defaultEndYear?: string;
}

export default function HDXDataExplorer({
    displayMode = 'general',
    defaultIndicator = 'idps',
    defaultCountryCode = 'SOM',
    defaultStartYear = '2020',
    defaultEndYear = new Date().getFullYear().toString()
  }: HDXDataExplorerProps) {
  
  const [selectedIndicator, setSelectedIndicator] = useState(
      HDX_CONFIG.find(ind => ind.id === defaultIndicator) || HDX_CONFIG[0]
  );
  const [selectedCountry, setSelectedCountry] = useState(
      COUNTRIES.find(c => c.code === defaultCountryCode) || COUNTRIES[3]
  );
  const [startYear, setStartYear] = useState(defaultStartYear);
  const [endYear, setEndYear] = useState(defaultEndYear);
  
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHDXData = async () => {
      setIsLoading(true);
      setError("");

      try {
        // <-- Called the server action here!
        const json = await getHDXData(selectedIndicator.endpoint, selectedCountry.name);
        
        if (!json.data || json.data.length === 0) {
          setChartData([]);
          setIsLoading(false);
          return;
        }

        let formattedData = json.data.map((item: any) => {
          const rawDate = item.reference_period_start || item.date || item.reporting_round || item.year;
          const year = rawDate ? new Date(rawDate).getFullYear().toString() : "Unknown";
          return {
            label: year,
            [selectedIndicator.label]: item[selectedIndicator.valueKey] || 0
          };
        });

        formattedData = formattedData.filter((item: any) => 
          item.label >= startYear && item.label <= endYear
        );

        const aggregatedMap: Record<string, number> = {};
        formattedData.forEach((item: any) => {
          if (!aggregatedMap[item.label]) aggregatedMap[item.label] = 0;
          aggregatedMap[item.label] += item[selectedIndicator.label];
        });

        const finalChartData = Object.entries(aggregatedMap)
          .sort(([yearA], [yearB]) => Number(yearA) - Number(yearB))
          .map(([year, total]) => ({
            label: year,
            [selectedIndicator.label]: total
          }));

        setChartData(finalChartData);

      } catch (err) {
        console.error(err);
        setError("Unable to load dataset.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHDXData();
  }, [selectedIndicator, selectedCountry, startYear, endYear]);

  const isGuided = displayMode === 'guided';

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-slate-100 my-10">
      
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-slate-50 p-4 rounded-2xl items-center">
        <div className="flex items-center gap-3 text-slate-500 font-bold px-2">
            <FiFilter className="w-5 h-5" />
            <span className="hidden md:inline uppercase tracking-widest text-xs">
                {isGuided ? 'Timeline' : 'Filters'}
            </span>
        </div>
        
        {!isGuided && (
            <>
                <select 
                className="flex-1 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={selectedIndicator.id}
                onChange={(e) => setSelectedIndicator(HDX_CONFIG.find(ind => ind.id === e.target.value) || HDX_CONFIG[0])}
                >
                {HDX_CONFIG.map(ind => (
                    <option key={ind.id} value={ind.id}>{ind.label}</option>
                ))}
                </select>

                <select 
                className="flex-1 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={selectedCountry.code}
                onChange={(e) => setSelectedCountry(COUNTRIES.find(c => c.code === e.target.value) || COUNTRIES[0])}
                >
                {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                ))}
                </select>
            </>
        )}

        <div className={`flex items-center gap-2 ${isGuided ? 'w-full justify-end' : ''}`}>
            <input 
              type="number" 
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              className="w-24 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl px-3 py-2.5 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-slate-400 font-medium">to</span>
            <input 
              type="number" 
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
              className="w-24 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl px-3 py-2.5 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
        </div>
      </div>

      <div className="w-full h-96 relative">
        {isLoading ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl animate-pulse">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            </div>
        ) : error || chartData.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 rounded-2xl text-slate-500 px-6 text-center">
                <FiAlertCircle className="w-8 h-8 mb-3 opacity-80" />
                <p className="font-bold">{error || "No records found."}</p>
            </div>
        ) : (
            <ChartRenderer type="bar" data={chartData} isCompact={false} />
        )}
      </div>
    </div>
  );
}