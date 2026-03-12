'use server';

export const runtime = 'edge';

export async function getHDXData(endpoint: string, countryCode: string) {
    try {
        const url = `https://hapi.humdata.org${endpoint}?location_code=${countryCode}`;

        const res = await fetch(url, {
            headers: {
                "X-HDX-HAPI-APP-IDENTIFIER": process.env.HDX_APP_IDENTIFIER || "toadstall-explorer",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                "Accept": "application/json",
                "Accept-Language": "en-US,en;q=0.9"
            },
            cache: 'no-store' 
        });

        if (!res.ok) {
            const errorText = await res.text();
            return { 
                success: false, 
                error: `HTTP ${res.status} ${res.statusText} | URL: ${url} | Details: ${errorText.substring(0, 200)}` 
            };
        }

        const json = await res.json();
        return { success: true, data: json.data };
        
    } catch (error: any) {
        console.error("HDX Fetch Error:", error);
        return { 
            success: false, 
            error: `Server Exception: ${error.message || error.toString()}` 
        };
    }
}