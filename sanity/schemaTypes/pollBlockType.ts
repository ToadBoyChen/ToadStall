import { defineArrayMember, defineField } from 'sanity'

export const pollBlock = defineArrayMember({
    type: 'object',
    name: 'poll',
    title: 'Poll',
    fields: [
        defineField({
            name: 'question',
            title: 'Question',
            type: 'string',
            validation: Rule => Rule.required().min(5).max(300),
        }),
        defineField({
            name: 'options',
            title: 'Options',
            type: 'array',
            validation: Rule => Rule.required().min(2).max(10),
            of: [
                defineArrayMember({
                    type: 'object',
                    fields: [
                        defineField({
                            name: 'text',
                            title: 'Option Text',
                            type: 'string',
                            validation: Rule => Rule.required().max(150),
                        }),
                    ],
                    preview: {
                        select: { title: 'text' },
                        prepare({ title }) { return { title: title || 'Unnamed option' } }
                    }
                }),
            ],
        }),
        defineField({
            name: 'endsAt',
            title: 'End Date / Time (Optional)',
            type: 'datetime',
            description: 'Leave blank for an open-ended poll.',
        }),
        defineField({
            name: 'allowChangeVote',
            title: 'Allow voters to change their vote',
            type: 'boolean',
            initialValue: true,
        }),
    ],
    preview: {
        select: { title: 'question', options: 'options' },
        prepare({ title, options }) {
            const count = Array.isArray(options) ? options.length : 0;
            return {
                title: title || 'Untitled Poll',
                subtitle: `${count} option${count !== 1 ? 's' : ''}`,
            }
        }
    }
})
