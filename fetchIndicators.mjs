import fs from 'fs';
import path from 'path';

const POPULAR_INDICATORS = [
    'NY.GDP.MKTP.CD',
    'NY.GDP.PCAP.CD',
    'SP.POP.TOTL',
    'SP.DYN.LE00.IN',
    'EN.ATM.CO2E.PC',
    'IT.NET.USER.ZS',
    'SL.UEM.TOTL.ZS',
    'FP.CPI.TOTL.ZG',
    'SE.PRM.ENRR',
    'SH.DYN.MORT'
];

async function generateIndicatorsList() {
    const customIndicators = process.argv.slice(2);
    
    const allIndicatorIds = [...new Set([...POPULAR_INDICATORS, ...customIndicators])];
    
    console.log(`Fetching ${allIndicatorIds.length} specific World Bank Indicators...`);

    try {
        const fetchPromises = allIndicatorIds.map(async (id) => {
            const url = `https://api.worldbank.org/v2/indicator/${id}?format=json`;
            const response = await fetch(url);
            
            if (!response.ok) {
                console.warn(`⚠️ Warning: HTTP error ${response.status} for indicator '${id}'`);
                return null;
            }
            
            const json = await response.json();
            
            if (json[1] && json[1].length > 0) {
                return {
                    id: json[1][0].id,
                    label: json[1][0].name
                };
            } else {
                console.warn(`⚠️ Warning: Indicator ID '${id}' not found in the World Bank database.`);
                return null;
            }
        });

        const results = await Promise.all(fetchPromises);
        
        const formattedIndicators = results.filter(ind => ind !== null);

        if (formattedIndicators.length === 0) {
            throw new Error("No valid indicators were fetched. Check your connection or IDs.");
        }

        const outputPath = path.join(process.cwd(), 'lib', 'worldBankIndicators.json');
        fs.writeFileSync(outputPath, JSON.stringify(formattedIndicators, null, 4));

        console.log(`✅ Success! Saved ${formattedIndicators.length} indicators to ${outputPath}`);

    } catch (error) {
        console.error("❌ Failed to fetch indicators:", error);
    }
}

generateIndicatorsList();