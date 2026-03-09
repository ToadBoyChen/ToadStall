import { Client, Account, Databases } from 'appwrite';

// Initialize the Appwrite Client
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT as string)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string);

// Export the services we need
export const account = new Account(client);
export const databases = new Databases(client);

// Export the Database ID for easy access in our queries
export const appwriteDatabaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string;