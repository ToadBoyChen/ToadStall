import {defineField, defineType} from 'sanity'
import {CommentIcon} from '@sanity/icons'

export const communityType = defineType({
  name: 'community',
  title: 'Community',
  type: 'document',
  icon: CommentIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Topic Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
    }),

    defineField({
      name: 'author',
      title: 'Official Author (Sanity)',
      type: 'reference',
      to: [{type: 'author'}],
      description: 'Use this if a staff member wrote the post. Otherwise, rely on the Appwrite ID below.',
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'category'}],
        }
      ],
    }),

    defineField({
      name: 'authorName',
      title: 'Author Name (Appwrite User)',
      type: 'string',
    }),
    defineField({
      name: 'authorAppwriteId',
      title: 'Author Appwrite ID',
      type: 'string',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Open', value: 'open'},
          {title: 'Closed', value: 'closed'},
        ],
      },
    }),
    defineField({
      name: 'publishedAt',
      title: 'Date Started',
      type: 'datetime',
    }),
    defineField({
      name: 'body',
      title: 'Initial Post / Context',
      type: 'text',
    }),
    defineField({
      name: 'chart',
      title: 'Embedded Chart',
      type: 'object',
      description: 'Optional World Bank data chart embedded in this post.',
      fields: [
        defineField({ name: 'indicator', type: 'string', title: 'Indicator ID' }),
        defineField({ name: 'countries', type: 'array', of: [{ type: 'string' }], title: 'Country Codes' }),
        defineField({ name: 'startYear', type: 'string', title: 'Start Year' }),
        defineField({ name: 'endYear', type: 'string', title: 'End Year' }),
        defineField({ name: 'chartType', type: 'string', title: 'Chart Type' }),
        defineField({ name: 'smartYAxis', type: 'boolean', title: 'Auto-scale Y Axis' }),
      ],
    }),
  ],
})