import { defineType, defineArrayMember, defineField } from 'sanity'
import { ImageIcon } from '@sanity/icons'

export const blockContentType = defineType({
    title: 'Block Content',
    name: 'blockContent',
    type: 'array',
    of: [
        defineArrayMember({
            type: 'block',
            styles: [
                { title: 'Normal', value: 'normal' },
                { title: 'H1', value: 'h1' },
                { title: 'H2', value: 'h2' },
                { title: 'H3', value: 'h3' },
                { title: 'H4', value: 'h4' },
                { title: 'Quote', value: 'blockquote' },
            ],
            lists: [
                { title: 'Bullet', value: 'bullet' },
                { title: 'Numbered', value: 'number' },
                { title: 'Lettered', value: 'alpha' }
            ],
            marks: {
                decorators: [
                    { title: 'Strong', value: 'strong' },
                    { title: 'Emphasis', value: 'em' },
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

        defineArrayMember({
            type: 'image',
            name: 'image',
            icon: ImageIcon,
            options: { hotspot: true },
            fields: [
                {
                    name: 'alt',
                    type: 'string',
                    title: 'Alternative Text',
                }
            ]
        }),

        defineArrayMember({
            type: 'object',
            name: 'dataVisualizer',
            title: 'Data Chart',
            fields: [
                defineField({
                    name: 'chartType',
                    title: 'Chart Type',
                    type: 'string',
                    options: { list: ['bar', 'line', 'pie'] }
                }),
                
                defineField({
                    name: 'dataSource',
                    title: 'Data Source',
                    type: 'string',
                    options: {
                        list: [
                            { title: 'Manual Entry', value: 'manual' },
                            { title: 'Live HDX HAPI', value: 'hdx' }
                        ],
                        layout: 'radio'
                    },
                    initialValue: 'manual'
                }),

                defineField({
                    name: 'chartData',
                    title: 'Manual Chart Data',
                    type: 'array',
                    hidden: ({ parent }) => parent?.dataSource === 'hdx',
                    of: [{ type: 'object', fields: [{ name: 'label', type: 'string' }, { name: 'value', type: 'number' }] }]
                }),

                defineField({
                    name: 'hdxEndpoint',
                    title: 'HDX Dataset',
                    type: 'string',
                    hidden: ({ parent }) => parent?.dataSource !== 'hdx',
                    options: {
                        list: [
                            { title: 'Internally Displaced Persons', value: '/api/v2/affected-people/idps' }, //
                            { title: 'Food Prices', value: '/api/v2/food-security-nutrition-poverty/food-prices-market-monitor' }, //
                            { title: 'Conflict Events', value: '/api/v2/coordination-context/conflict-events' } //
                        ]
                    }
                }),
                defineField({
                    name: 'locationName',
                    title: 'Country / Location',
                    type: 'string',
                    description: 'e.g., Mali or Somalia',
                    hidden: ({ parent }) => parent?.dataSource !== 'hdx',
                })
            ]
        }),

    ],
})