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
            return { success: false, error: `API Error: ${res.status}` };
        }

        const json = await res.json();
        return { success: true, data: json.data };
        
    } catch (error) {
        console.error("HDX Fetch Error:", error);
        return { success: false, error: "Failed to fetch HDX data" };
    }
}