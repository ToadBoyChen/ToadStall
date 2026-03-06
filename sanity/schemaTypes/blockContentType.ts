import {defineType, defineArrayMember, defineField} from 'sanity'
import {ImageIcon} from '@sanity/icons'

/**
 * This is the schema type for block content used in the post document type
 * Importing this type into the studio configuration's `schema` property
 * lets you reuse it in other document types with:
 * {
 * name: 'someName',
 * title: 'Some title',
 * type: 'blockContent'
 * }
 */

export const blockContentType = defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'H1', value: 'h1'},
        {title: 'H2', value: 'h2'},
        {title: 'H3', value: 'h3'},
        {title: 'H4', value: 'h4'},
        {title: 'Quote', value: 'blockquote'},
      ],
      lists: [{title: 'Bullet', value: 'bullet'}],
      marks: {
        decorators: [
          {title: 'Strong', value: 'strong'},
          {title: 'Emphasis', value: 'em'},
        ],
        annotations: [
          {
            title: 'URL',
            name: 'link',
            type: 'object',
            fields: [
              {
                title: 'URL',
                name: 'href',
                type: 'url',
              },
            ],
          },
        ],
      },
    }),
    
    // Default Image Block
    defineArrayMember({
      type: 'image',
      icon: ImageIcon,
      options: {hotspot: true},
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        }
      ]
    }),

    // --- YOUR NEW DATA VISUALIZATION BLOCK ---
    defineArrayMember({
      type: 'object',
      name: 'dataVisualizer',
      title: 'Data Visualization',
      fields: [
        defineField({
          name: 'vizType',
          title: 'Type of Visualization',
          type: 'string',
          options: {
            list: [
              { title: 'Interactive Migration Map', value: 'migration-map' },
              { title: '3D Climate Globe', value: 'climate-globe' },
              { title: 'Data Summary Card', value: 'data-card' }
            ]
          }
        }),
        defineField({
          name: 'caption',
          title: 'Caption',
          type: 'string'
        })
      ]
    }),

  ],
})