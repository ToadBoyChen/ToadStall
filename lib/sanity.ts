import { createClient } from 'next-sanity';

const sanityConfig = {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID as string,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET as string,
    apiVersion: '2024-03-13',
    useCdn: false, 
};

export const sanityClient = createClient(sanityConfig);

export const writeClient = createClient({
    ...sanityConfig,
    token: process.env.SANITY_API_WRITE_TOKEN,
});