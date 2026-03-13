import { client } from '@/sanity/lib/client';
import { notFound } from 'next/navigation';
import PageContent from '@/components/general/PageContent';
import { sharedPortableTextComponents } from '@/lib/portableTextComponents';

const QUERY = `*[ _type == "article" && slug.current == $slug ][0] {
    _id,
    title,
    publishedAt,
    body,
    "authorName": author->name, // Grab the string name
    mainImage
}`;

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
            portableTextComponents={sharedPortableTextComponents}
        />
    );
}