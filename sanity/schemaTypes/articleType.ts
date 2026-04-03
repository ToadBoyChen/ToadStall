import { defineField, defineType } from 'sanity'
import { DocumentTextIcon } from '@sanity/icons'

export const articleType = defineType({
    name: 'article',
    title: 'Article',
    type: 'document',
    icon: DocumentTextIcon,
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: { source: 'title', maxLength: 96 },
            validation: (rule) => rule.required(),
        }),

        // Glob Entries

        defineField({
            name: 'author',
            title: 'Author',
            type: 'reference',
            to: [{ type: 'author' }],
        }),
        defineField({
            name: 'categories',
            title: 'Categories',
            type: 'array',
            of: [
                {
                    type: 'reference',
                    to: [{ type: 'category' }],
                },
            ],
        }),
        defineField({
            name: 'mainImage',
            title: 'Main image',
            type: 'image',
            options: { hotspot: true },
        }),
        defineField({
            name: 'publishedAt',
            title: 'Published at',
            type: 'datetime',
        }),
        defineField({
            name: 'body',
            title: 'Body',
            type: 'blockContent',
        }),
    ],
})