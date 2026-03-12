import { defineType, defineArrayMember, defineField } from 'sanity'
import { ImageIcon, SearchIcon } from '@sanity/icons' // Added SearchIcon for the explorer

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
            title: 'Static Data Chart',
            fields: [
                defineField({
                    name: 'chartType',
                    title: 'Chart Type',
                    type: 'string',
                    options: { list: ['bar', 'line', 'pie', 'doughnut'] }
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
                    title: 'Chart Series',
                    description: 'Add a series (e.g., "Cats" or "Revenue"), then add data points to it.',
                    type: 'array',
                    hidden: ({ parent }) => parent?.dataSource === 'hdx',
                    of: [
                        defineArrayMember({
                            type: 'object',
                            title: 'Data Series',
                            fields: [
                                defineField({
                                    name: 'seriesName',
                                    title: 'Series Name (e.g., "Cats")',
                                    type: 'string',
                                    validation: Rule => Rule.required()
                                }),
                                defineField({
                                    name: 'dataPoints',
                                    title: 'Data Points (X and Y values)',
                                    type: 'array',
                                    of: [
                                        defineArrayMember({
                                            type: 'object',
                                            fields: [
                                                defineField({
                                                    name: 'label',
                                                    title: 'X-Axis Label (e.g., "Jan" or "2026")',
                                                    type: 'string',
                                                    validation: Rule => Rule.required()
                                                }),
                                                defineField({
                                                    name: 'value',
                                                    title: 'Y-Axis Value',
                                                    type: 'number',
                                                    validation: Rule => Rule.required()
                                                })
                                            ],
                                            preview: {
                                                select: { title: 'label', subtitle: 'value' }
                                            }
                                        })
                                    ]
                                })
                            ],
                            preview: {
                                select: { title: 'seriesName' },
                                prepare({ title }) {
                                    return { title: title || 'Unnamed Series' }
                                }
                            }
                        })
                    ]
                }),

                defineField({
                    name: 'hdxEndpoint',
                    title: 'HDX Dataset',
                    type: 'string',
                    hidden: ({ parent }) => parent?.dataSource !== 'hdx',
                    options: {
                        list: [
                            { title: 'Internally Displaced Persons', value: '/api/v2/affected-people/idps' },
                            { title: 'Food Prices', value: '/api/v2/food-security-nutrition-poverty/food-prices-market-monitor' },
                            { title: 'Conflict Events', value: '/api/v2/coordination-context/conflict-events' }
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

        // The Interactive HDX Explorer Block
        defineArrayMember({
            type: 'object',
            name: 'hdxExplorer',
            title: 'Interactive HDX Explorer',
            fields: [
                defineField({
                    name: 'title',
                    title: 'Widget Title (Optional)',
                    type: 'string',
                }),
                defineField({
                    name: 'displayMode',
                    title: 'Display Mode',
                    type: 'string',
                    description: 'General gives the user full control. Guided locks the indicator and country, but lets them adjust the years.',
                    options: {
                        list: [
                            { title: 'General Explorer (Full Freedom)', value: 'general' },
                            { title: 'Guided Explorer (Lock to Specific Data)', value: 'guided' }
                        ],
                        layout: 'radio'
                    },
                    initialValue: 'general'
                }),
                defineField({
                    name: 'defaultIndicator',
                    title: 'Data Indicator to display',
                    type: 'string',
                    hidden: ({ parent }) => parent?.displayMode !== 'guided',
                    options: {
                        list: [
                            { title: 'Internally Displaced Persons', value: 'idps' },
                            { title: 'Refugees', value: 'refugees' },
                            { title: 'Returnees', value: 'returnees' },
                            { title: 'Food Prices', value: 'food-prices' },
                            { title: 'Conflict Events', value: 'conflict' },
                            { title: 'Poverty Rate', value: 'poverty' },
                        ]
                    }
                }),
                defineField({
                    name: 'defaultCountryCode',
                    title: 'Default Country Code (ISO3)',
                    type: 'string',
                    description: 'e.g., SOM, MLI, AFG. Defaults to SOM if left blank.',
                }),
                defineField({
                    name: 'defaultStartYear',
                    title: 'Default Start Year',
                    type: 'string',
                    initialValue: '2020'
                }),
                defineField({
                    name: 'defaultEndYear',
                    title: 'Default End Year',
                    type: 'string',
                    initialValue: '2026'
                })
            ]
        }),

    ],
})