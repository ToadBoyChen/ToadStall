'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { account, databases, appwriteDatabaseId } from '@/lib/appwrite';
import { ID, AppwriteException } from 'appwrite';
import { useAuth } from '@/context/AuthContext';

export default function AuthPage() {
    const router = useRouter();

    const { checkUser } = useAuth();

    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignUp) {
                const userAccount = await account.create(ID.unique(), email, password, name);

                await account.createEmailPasswordSession(email, password);

                await databases.createDocument(
                    appwriteDatabaseId,
                    process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID as string,
                    ID.unique(),
                    {
                        userID: userAccount.$id,
                        username: name,
                    }
                );
            } else {
                await account.createEmailPasswordSession(email, password);
            }

            await checkUser();

            router.push('/community');

        } catch (err) {
            if (err instanceof AppwriteException) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-3xl font-black text-slate-800 mb-6 text-center">
                    {isSignUp ? 'Join the Community' : 'Welcome Back'}
                </h2>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 font-medium border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    {isSignUp && (
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-100 border-transparent rounded-lg focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                                placeholder="Your display name"
                                required={isSignUp}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-100 border-transparent rounded-lg focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                            placeholder="you@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-100 border-transparent rounded-lg focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                            placeholder="••••••••"
                            required
                            minLength={8}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
                    </button>
                </form>

                <div className="mt-6 text-center pt-4 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError('');
                        }}
                        className="text-slate-500 hover:text-emerald-600 font-medium text-sm transition-colors"
                    >
                        {isSignUp
                            ? 'Already have an account? Sign in'
                            : 'Need an account? Sign up'}
                    </button>
                </div>
            </div>
        </div>
    );
}