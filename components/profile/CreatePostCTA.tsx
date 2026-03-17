'use client';

import CreatePostButton from '../community/CreatePostButton';
import { FiMessageSquare } from 'react-icons/fi';

export default function CreatePostCTA() {
    return (
        <div className="bg-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 my-8 shadow-sm">
            <div className="flex items-center gap-5 text-center sm:text-left">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                    <FiMessageSquare className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Start a Discussion</h3>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        Got a question, idea, or finding? Share it with the community.
                    </p>
                </div>
            </div>
            <div className="shrink-0 w-full sm:w-auto flex justify-center">
                {/* Your existing button goes here */}
                <CreatePostButton />
            </div>
        </div>
    );
}