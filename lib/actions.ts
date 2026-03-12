'use server';

export async function getHDXData(endpoint: string, countryName: string) {
    try {
        const url = `https://hapi.humdata.org${endpoint}?location_name=${encodeURIComponent(countryName)}`;

        const res = await fetch(url, {
            headers: {
                "X-HDX-HAPI-APP-IDENTIFIER": process.env.HDX_APP_IDENTIFIER || "toadstall-explorer"
            },
            next: { revalidate: 3600 } 
        });

        if (!res.ok) {
            throw new Error(`HDX API responded with status: ${res.status}`);
        }

        return await res.json();
        
    } catch (error) {
        console.error("HDX Fetch Error:", error);
        throw new Error("Failed to fetch HDX data");
    }
}