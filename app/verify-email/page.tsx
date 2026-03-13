'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { account, databases, appwriteDatabaseId } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { FiCheckCircle, FiXCircle, FiLoader, FiAlertCircle } from 'react-icons/fi';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const userId = searchParams.get('userId');
        const secret = searchParams.get('secret');

        if (!userId || !secret) {
            setStatus('invalid');
            return;
        }

        const confirmVerification = async () => {
            try {
                await account.updateVerification(userId, secret);
                const profileRes = await databases.listDocuments(
                    appwriteDatabaseId,
                    process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID as string,
                    [Query.equal('userID', userId), Query.limit(1)]
                );
                if (profileRes.documents.length > 0) {
                    await databases.updateDocument(
                        appwriteDatabaseId,
                        process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID as string,
                        profileRes.documents[0].$id,
                        { isVerified: true }
                    );
                }

                setStatus('success');
                
                setTimeout(() => {
                    router.push('/profile');
                }, 3000);

            } catch (error: any) {
                console.error('Verification failed:', error);
                setStatus('error');
                setErrorMessage(error.message || 'The verification link may have expired.');
            }
        };

        confirmVerification();
    }, [searchParams, router]);

    return (
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-slate-100 max-w-md w-full text-center">
            
            {status === 'loading' && (
                <div className="flex flex-col items-center">
                    <FiLoader className="w-12 h-12 text-emerald-500 animate-spin mb-6" />
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Verifying Email...</h1>
                    <p className="text-slate-500 font-medium">Please wait a moment while we confirm your account.</p>
                </div>
            )}

            {status === 'success' && (
                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                        <FiCheckCircle className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Email Verified!</h1>
                    <p className="text-slate-500 font-medium mb-8">
                        Your account is now fully verified. Redirecting you to your profile...
                    </p>
                    <Link 
                        href="/profile" 
                        className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-full font-bold transition-colors w-full"
                    >
                        Go to Profile
                    </Link>
                </div>
            )}

            {status === 'error' && (
                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                        <FiXCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Verification Failed</h1>
                    <p className="text-slate-500 font-medium mb-4">
                        {errorMessage}
                    </p>
                    <Link 
                        href="/profile" 
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-3 rounded-full font-bold transition-colors w-full mt-4"
                    >
                        Return to Profile
                    </Link>
                </div>
            )}

            {status === 'invalid' && (
                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                        <FiAlertCircle className="w-8 h-8 text-amber-600" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Invalid Link</h1>
                    <p className="text-slate-500 font-medium mb-8">
                        This verification link is invalid or missing information.
                    </p>
                    <Link 
                        href="/profile" 
                        className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-full font-bold transition-colors w-full"
                    >
                        Go to Profile
                    </Link>
                </div>
            )}

        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <main className="py-32 flex items-center justify-center">
            <Suspense fallback={
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            }>
                <VerifyEmailContent />
            </Suspense>
        </main>
    );
}