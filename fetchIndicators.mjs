// fetchIndicators.mjs
import fs from 'fs';
import path from 'path';

async function generateIndicatorsList() {
    console.log("Fetching World Development Indicators...");

    try {
        // We use source=2 to get the premium/most popular World Bank indicators
        // per_page=250 grabs a huge chunk of the best ones at once
        const url = 'https://api.worldbank.org/v2/indicator?source=2&format=json&per_page=250';
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API responded with status: ${response.status}`);
        
        const json = await response.json();
        const rawIndicators = json[1];

        if (!rawIndicators || rawIndicators.length === 0) {
            throw new Error("No indicators found in the response.");
        }

        // Map them into our lean { id, label } format
        const formattedIndicators = rawIndicators.map(ind => ({
            id: ind.id,
            label: ind.name
        }));

        // Determine where to save the file (adjust 'lib' if your folder is named differently)
        const outputPath = path.join(process.cwd(), 'lib', 'worldBankIndicators.json');

        // Write the file beautifully formatted
        fs.writeFileSync(outputPath, JSON.stringify(formattedIndicators, null, 4));

        console.log(`✅ Success! Saved ${formattedIndicators.length} indicators to ${outputPath}`);

    } catch (error) {
        console.error("❌ Failed to fetch indicators:", error);
    }
}

generateIndicatorsList();