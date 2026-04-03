import { defineType, defineArrayMember, defineField } from 'sanity'
import { ImageIcon, SearchIcon } from '@sanity/icons'

import worldBankIndicators from '@/lib/worldBankIndicators.json';

const sanityIndicatorOptions = worldBankIndicators.map((ind: any) => ({
    title: ind.label,
    value: ind.id
}));

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

        // 1. The Static Data Visualizer Block
        defineArrayMember({
            type: 'object',
            name: 'dataVisualizer',
            title: 'Static Data Chart',
            fields: [
                defineField({
                    name: 'chartType',
                    title: 'Chart Type',
                    type: 'string',
                    options: { list: ['bar', 'line', 'pie'] }
                }),
                defineField({
                    name: 'smartYAxis',
                    title: 'Smart Y-Axis (Auto-Scale)',
                    type: 'boolean',
                    description: 'Turn on to zoom the chart in on the data range instead of starting at 0. Best for Line charts.',
                    initialValue: true
                }),
                defineField({
                    name: 'dataSource',
                    title: 'Data Source',
                    type: 'string',
                    options: {
                        list: [
                            { title: 'Manual Entry', value: 'manual' },
                            { title: 'World Bank API', value: 'worldbank' }
                        ],
                        layout: 'radio'
                    },
                    initialValue: 'manual'
                }),

                defineField({
                    name: 'chartData',
                    title: 'Chart Series',
                    description: 'Add a series (e.g., "Revenue"), then add data points to it.',
                    type: 'array',
                    hidden: ({ parent }) => parent?.dataSource === 'worldbank',
                    of: [
                        defineArrayMember({
                            type: 'object',
                            title: 'Data Series',
                            fields: [
                                defineField({
                                    name: 'seriesName',
                                    title: 'Series Name',
                                    type: 'string',
                                    validation: Rule => Rule.required()
                                }),
                                defineField({
                                    name: 'dataPoints',
                                    title: 'Data Points',
                                    type: 'array',
                                    of: [
                                        defineArrayMember({
                                            type: 'object',
                                            fields: [
                                                defineField({
                                                    name: 'label',
                                                    title: 'X-Axis Label (e.g., "2026")',
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
                                            preview: { select: { title: 'label', subtitle: 'value' } }
                                        })
                                    ]
                                })
                            ],
                            preview: {
                                select: { title: 'seriesName' },
                                prepare({ title }) { return { title: title || 'Unnamed Series' } }
                            }
                        })
                    ]
                }),

                // World Bank API Fields
                defineField({
                    name: 'wbIndicator',
                    title: 'World Bank Indicator',
                    type: 'string',
                    hidden: ({ parent }) => parent?.dataSource !== 'worldbank',
                    options: {
                        list: sanityIndicatorOptions
                    }
                }),
                defineField({
                    name: 'wbSeries',
                    title: 'Countries / Series',
                    description: 'Add one entry per country — each becomes a separate line or bar on the chart.',
                    type: 'array',
                    hidden: ({ parent }) => parent?.dataSource !== 'worldbank',
                    of: [
                        defineArrayMember({
                            type: 'object',
                            fields: [
                                defineField({
                                    name: 'countryCode',
                                    title: 'Country Code (ISO3)',
                                    type: 'string',
                                    description: 'e.g., USA, GBR, CHN, WLD',
                                    validation: Rule => Rule.required()
                                }),
                                defineField({
                                    name: 'seriesLabel',
                                    title: 'Label (Optional)',
                                    type: 'string',
                                    description: 'Override the country name shown in the legend, e.g. "United Kingdom"'
                                }),
                            ],
                            preview: {
                                select: { title: 'seriesLabel', subtitle: 'countryCode' },
                                prepare({ title, subtitle }) {
                                    return { title: title || subtitle, subtitle: title ? subtitle : undefined }
                                }
                            }
                        })
                    ]
                }),
                // Kept for backward compatibility with existing blocks — hidden in editor
                defineField({
                    name: 'wbCountry',
                    title: 'Country Code (legacy)',
                    type: 'string',
                    hidden: true,
                }),
                defineField({
                    name: 'startYear',
                    title: 'Start Year (Optional)',
                    type: 'string',
                    description: 'e.g., 2010',
                    hidden: ({ parent }) => parent?.dataSource !== 'worldbank',
                }),
                defineField({
                    name: 'endYear',
                    title: 'End Year (Optional)',
                    type: 'string',
                    description: 'e.g., 2024',
                    hidden: ({ parent }) => parent?.dataSource !== 'worldbank',
                }),

                // Shared Fields
                defineField({
                    name: 'caption',
                    title: 'Chart Caption (Optional)',
                    type: 'string',
                    description: 'Displays a small italicized note under the chart.'
                })
            ]
        }),

        // 2. The Interactive World Bank Explorer Block (Focused Mode Only)
        defineArrayMember({
            type: 'object',
            name: 'worldBankExplorer',
            title: 'Interactive Data Explorer',
            icon: SearchIcon,
            fields: [
                defineField({
                    name: 'title',
                    title: 'Widget Title (Optional)',
                    type: 'string',
                }),
                defineField({
                    name: 'smartYAxis',
                    title: 'Smart Y-Axis (Auto-Scale)',
                    type: 'boolean',
                    description: 'Turn on to zoom the chart in on the data range instead of starting at 0. Best for Line charts.',
                    initialValue: true
                }),
                defineField({
                    name: 'defaultChartType',
                    title: 'Default Chart Type',
                    type: 'string',
                    options: {
                        list: [
                            { title: 'Line Chart', value: 'line' },
                            { title: 'Bar Chart', value: 'bar' },
                            { title: 'Pie Chart', value: 'pie' },
                        ]
                    },
                    initialValue: 'line'
                }),
                defineField({
                    name: 'indicator',
                    title: 'Data Indicator',
                    type: 'string',
                    validation: Rule => Rule.required(),
                    options: {
                        list: sanityIndicatorOptions
                    }
                }),
                defineField({
                    name: 'countries',
                    title: 'Countries',
                    description: 'Add one or more countries to compare. Users can add more interactively.',
                    type: 'array',
                    of: [
                        defineArrayMember({
                            type: 'object',
                            fields: [
                                defineField({
                                    name: 'countryCode',
                                    title: 'Country Code (ISO3)',
                                    type: 'string',
                                    description: 'e.g., USA, GBR, CHN, WLD',
                                    validation: Rule => Rule.required()
                                }),
                            ],
                            preview: {
                                select: { title: 'countryCode' },
                                prepare({ title }) { return { title } }
                            }
                        })
                    ]
                }),
                // Kept for backward compatibility — hidden in editor
                defineField({
                    name: 'countryCode',
                    title: 'Country Code (legacy)',
                    type: 'string',
                    hidden: true,
                }),
                defineField({
                    name: 'startYear',
                    title: 'Default Start Year',
                    type: 'string',
                    initialValue: '2000'
                }),
                defineField({
                    name: 'endYear',
                    title: 'Default End Year',
                    type: 'string',
                    initialValue: new Date().getFullYear().toString()
                })
            ],
            preview: {
                select: { title: 'title', indicator: 'indicator', country: 'countryCode' },
                prepare({ title, indicator, country }) {
                    return {
                        title: title || 'Data Explorer Widget',
                        subtitle: `${indicator} • ${country}`
                    }
                }
            }
        }),
    ],
})