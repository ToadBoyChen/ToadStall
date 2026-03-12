import { client } from '@/sanity/lib/client';
import { notFound } from 'next/navigation';
import PageContent from '@/components/general/PageContent';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';
import DynamicChartWrapper from '@/components/charts/DynamicChartWrapper';

const QUERY = `*[ _type == "community" && slug.current == $slug ][0] {
    _id,
    title,
    publishedAt,
    body,
    "authorName": author->name, // Grab the string name
    mainImage
}`;

const myPortableTextComponents = {
    types: {
        dataVisualizer: ({ value }: any) => {
            return <DynamicChartWrapper blockData={value} />;
        },
        image: ({ value }: any) => {
            if (!value?.asset?._ref) return null;
            return (
                <div className="relative w-full h-100 my-8 overflow-hidden rounded-xl">
                    <Image
                        src={urlFor(value).url()}
                        alt={value.alt || 'Inline post image'}
                        fill
                        className="object-cover"
                    />
                </div>
            );
        },
    },
    list: {
        alpha: ({ children }: any) => (
            <ol className="list-[lower-alpha] pl-6 my-6 space-y-2 marker:font-medium">
                {children}
            </ol>
        ),
    },
};

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const post = await client.fetch(QUERY, { slug: resolvedParams.slug });

    if (!post) notFound();

    return (
        <PageContent 
            id={post._id}
            title={post.title}
            publishedAt={post.publishedAt}
            authorName={post.authorName}
            mainImage={post.mainImage}
            body={post.body}
            portableTextComponents={myPortableTextComponents}
        />
    );
}