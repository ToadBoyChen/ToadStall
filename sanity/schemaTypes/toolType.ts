import {defineField, defineType} from 'sanity'
import {WrenchIcon} from '@sanity/icons'

export const toolType = defineType({
  name: 'tool',
  title: 'Tool',
  type: 'document',
  icon: WrenchIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Tool Name',
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
      name: 'url',
      title: 'Tool URL',
      type: 'url',
      description: 'Direct link to the tool.',
    }),
    defineField({
      name: 'pricing',
      title: 'Pricing Model',
      type: 'string',
      options: {
        list: ['Free', 'Freemium', 'Paid', 'Open Source'],
      },
    }),
    defineField({
      name: 'excerpt',
      title: 'Short Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'body',
      title: 'Full Review / Details',
      type: 'blockContent',
    }),
  ],
})