import { Client, Account, Databases } from 'appwrite';

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT as string)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string);

export const account = new Account(client);
export const databases = new Databases(client);
export const appwriteDatabaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string;