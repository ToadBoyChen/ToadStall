'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { account, databases, appwriteDatabaseId } from '@/lib/appwrite';
import { ID, AppwriteException } from 'appwrite';
import { useAuth } from '@/context/AuthContext';
import { FiMail, FiLock, FiUser, FiAlertCircle } from 'react-icons/fi';

export default function AuthPage() {
    const router = useRouter();
    const { checkUser } = useAuth();

    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (isSignUp && password !== confirmPassword) {
            setError('Passwords do not match. Please try again.');
            return;
        }

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

    const toggleMode = () => {
        setIsSignUp(!isSignUp);
        setError('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white/80 rounded-3xl p-8 md:p-10">
                
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
                        {isSignUp ? 'Join ToadStall' : 'Welcome Back'}
                    </h2>
                    <p className="text-slate-500 font-medium text-sm">
                        {isSignUp ? 'Create an account to join the discussion.' : 'Enter your credentials to access your account.'}
                    </p>
                </div>

                {error && (
                    <div className="flex items-start gap-2 bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 font-medium border border-red-100 animate-in fade-in zoom-in duration-200">
                        <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}
                
                <form onSubmit={handleAuth} className="space-y-5">
                    
                    {isSignUp && (
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-slate-700 ml-1">Display Name</label>
                            <div className="relative group">
                                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors w-5 h-5" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-slate-700 font-medium"
                                    placeholder="Jane Doe"
                                    required={isSignUp}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-slate-700 ml-1">Email Address</label>
                        <div className="relative group">
                            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors w-5 h-5" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-slate-700 font-medium"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-slate-700 ml-1">Password</label>
                        <div className="relative group">
                            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors w-5 h-5" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-slate-700 font-medium"
                                placeholder="••••••••"
                                required
                                minLength={8}
                            />
                        </div>
                    </div>

                    {isSignUp && (
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-slate-700 ml-1">Confirm Password</label>
                            <div className="relative group">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors w-5 h-5" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-slate-700 font-medium"
                                    placeholder="••••••••"
                                    required={isSignUp}
                                    minLength={8}
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black tracking-wide py-3.5 px-4 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4 shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
                    >
                        {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
                    </button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-slate-100">
                    <p className="text-slate-500 text-sm">
                        {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
                        <button
                            type="button"
                            onClick={toggleMode}
                            className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors outline-none focus:underline"
                        >
                            {isSignUp ? 'Sign in here' : 'Sign up for free'}
                        </button>
                    </p>
                </div>

            </div>
        </div>
    );
}