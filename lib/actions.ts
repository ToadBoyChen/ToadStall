'use server';

export async function getHDXData(endpoint: string, countryCode: string) {
    try {
        const url = `https://hapi.humdata.org${endpoint}?location_code=${countryCode}`;

        const res = await fetch(url, {
            headers: {
                "X-HDX-HAPI-APP-IDENTIFIER": process.env.HDX_APP_IDENTIFIER || "toadstall-explorer"
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