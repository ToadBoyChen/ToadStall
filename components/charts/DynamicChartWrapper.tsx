import ChartRenderer from './ChartRenderer';

export default async function DynamicChartWrapper({ blockData }: { blockData: any }) {
  let finalData: any[] = [];

  if (blockData.dataSource === 'manual' && blockData.chartData) {
    finalData = blockData.chartData;
  } 
  
  if (blockData.dataSource === 'hdx' && blockData.hdxEndpoint) {
    try {
      const hdxUrl = `https://hapi.humdata.org${blockData.hdxEndpoint}?location_name=${blockData.locationName || ''}`; 
      
      const res = await fetch(hdxUrl, {
        headers: {
          'X-HDX-HAPI-APP-IDENTIFIER': process.env.HDX_APP_IDENTIFIER || 'placeholder-id' 
        },
        next: { revalidate: 3600 }
      });
      
      if (res.ok) {
        const hdxResponse = await res.json();
        finalData = hdxResponse.data.map((item: any) => ({
          label: item.reporting_round || item.date || item.reference_period_start, 
          value: item.population || item.price || item.events
        }));
      } else {
        console.error("HDX API Error:", res.statusText);
      }
    } catch (error) {
      console.error("Failed to fetch HDX data:", error);
    }
  }

  return (
    <div className="my-10 p-2 rounded-2xl border border-slate-200 shadow-md">
      <ChartRenderer type={blockData.chartType} data={finalData} />
      
      {blockData.caption && (
        <p className="text-center text-sm text-slate-500 mt-6 italic">
          {blockData.caption}
        </p>
      )}
    </div>
  );
}