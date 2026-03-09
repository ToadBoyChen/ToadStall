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
      title: 'Started By',
      type: 'reference',
      to: {type: 'author'},
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
        layout: 'radio',
      },
      initialValue: 'open',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Date Started',
      type: 'datetime',
    }),
    defineField({
      name: 'body',
      title: 'Initial Post / Context',
      type: 'blockContent',
    }),
  ],
})