import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';
import DynamicChartWrapper from '@/components/charts/DynamicChartWrapper';
import DataExplorer from '@/components/charts/DataExplorer';
import PollBlock from '@/components/polls/PollBlock';

export const sharedPortableTextComponents = {
    types: {
        dataVisualizer: ({ value }: any) => {
            return <DynamicChartWrapper blockData={value} />;
        },

        worldBankExplorer: ({ value }: any) => {
            return (
                <div className="my-12">
                    {value.title && (
                        <h3 className="text-2xl font-bold mb-6 text-slate-800 tracking-tight">
                            {value.title}
                        </h3>
                    )}
                    <DataExplorer
                        indicator={value.indicator}
                        countries={value.countries}
                        countryCode={value.countryCode}
                        startYear={value.startYear}
                        endYear={value.endYear}
                        defaultChartType={value.defaultChartType}
                        smartYAxis={value.smartYAxis}
                    />
                </div>
            );
        },

        poll: ({ value }: any) => {
            return <PollBlock value={value} />;
        },

        image: ({ value }: any) => {
            if (!value?.asset?._ref) return null;
            return (
                <div className="relative w-full h-100 my-8 overflow-hidden rounded-xl shadow-md">
                    <Image
                        src={urlFor(value).url()}
                        alt={value.alt || 'Inline article image'}
                        fill
                        className="object-cover"
                    />
                </div>
            );
        },
    },
    list: {
        alpha: ({ children }: any) => (
            <ol className="list-[lower-alpha] pl-6 my-6 space-y-2 marker:font-medium text-slate-700">
                {children}
            </ol>
        ),
    },
};