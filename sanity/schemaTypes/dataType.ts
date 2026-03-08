import {defineField, defineType} from 'sanity'
import {DatabaseIcon} from '@sanity/icons'

export const dataType = defineType({
  name: 'data',
  title: 'Data Hub',
  type: 'document',
  icon: DatabaseIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Dataset Title',
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
      name: 'sourceName',
      title: 'Data Source Name',
      type: 'string',
      description: 'e.g., HDX, World Bank, UN OCHA',
    }),
    defineField({
      name: 'sourceUrl',
      title: 'External Source URL',
      type: 'url',
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Dataset Last Updated',
      type: 'date',
    }),
    defineField({
      name: 'body',
      title: 'Description & Visualizations',
      type: 'blockContent',
      description: 'Use the Data Chart block here to embed HDX visualizations.',
    }),
  ],
})