// Shared color map — full class strings so Tailwind never purges them
export const TAG_COLORS = {
    red:    { label: 'Red',    swatch: '#ef4444', bg: 'bg-red-100',    text: 'text-red-700'    },
    rose:   { label: 'Rose',   swatch: '#f43f5e', bg: 'bg-rose-100',   text: 'text-rose-700'   },
    orange: { label: 'Orange', swatch: '#f97316', bg: 'bg-orange-100', text: 'text-orange-700' },
    amber:  { label: 'Amber',  swatch: '#f59e0b', bg: 'bg-amber-100',  text: 'text-amber-700'  },
    yellow: { label: 'Yellow', swatch: '#eab308', bg: 'bg-yellow-100', text: 'text-yellow-700' },
    green:  { label: 'Green',  swatch: '#22c55e', bg: 'bg-green-100',  text: 'text-green-700'  },
    teal:   { label: 'Teal',   swatch: '#14b8a6', bg: 'bg-teal-100',   text: 'text-teal-700'   },
    blue:   { label: 'Blue',   swatch: '#3b82f6', bg: 'bg-blue-100',   text: 'text-blue-700'   },
    indigo: { label: 'Indigo', swatch: '#6366f1', bg: 'bg-indigo-100', text: 'text-indigo-700' },
    purple: { label: 'Purple', swatch: '#a855f7', bg: 'bg-purple-100', text: 'text-purple-700' },
    slate:  { label: 'Slate',  swatch: '#64748b', bg: 'bg-slate-100',  text: 'text-slate-600'  },
    zinc:   { label: 'Black',  swatch: '#27272a', bg: 'bg-zinc-800',   text: 'text-zinc-100'   },
} as const;

export type TagColor = keyof typeof TAG_COLORS;

export interface UserTag {
    $id: string;
    label: string;
    emoji: string;
    color: string;
}

interface UserTagBadgeProps {
    label: string;
    emoji?: string | null;
    color?: string | null;
    size?: 'sm' | 'md';
}

export default function UserTagBadge({ label, emoji, color, size = 'sm' }: UserTagBadgeProps) {
    const scheme = TAG_COLORS[color as TagColor] ?? TAG_COLORS.slate;
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap ${scheme.bg} ${scheme.text} ${
                size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-sm'
            }`}
        >
            {emoji && <span className="leading-none">{emoji}</span>}
            <span>{label}</span>
        </span>
    );
}
