import { Client, Account, Databases, Storage } from 'appwrite';

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT as string)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const appwriteDatabaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string;
export const appwritePfpsBucketId = process.env.NEXT_PUBLIC_APPWRITE_PFPS_BUCKET_ID as string;