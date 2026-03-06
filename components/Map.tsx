export default function Map({ caption }: { caption?: string }) {
    return (
        <div className="my-12 w-full p-6 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center h-96">
            <span className="text-slate-500 font-bold text-xl">Interactive D3.js Migration Map Loading...</span>
            {caption && <p className="text-sm text-slate-400 mt-4">{caption}</p>}
        </div>
    );
}