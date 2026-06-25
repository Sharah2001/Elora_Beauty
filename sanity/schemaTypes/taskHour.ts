import {defineField, defineType} from 'sanity'

export const taskHourType = defineType({
  name: 'taskHour',
  title: 'Task Hours',
  type: 'document',
  fields: [
    defineField({
      name: 'assignee',
      title: 'Assignee',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'task',
      title: 'Task',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'hours',
      title: 'Hours',
      type: 'number',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'relatedSchemaTypes',
      title: 'Related Schema Types',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: ['Planned', 'In Progress', 'Completed'],
        layout: 'radio',
      },
      initialValue: 'Completed',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display Order',
      type: 'number',
      validation: (rule) => rule.integer().min(0),
    }),
  ],
  orderings: [
    {
      title: 'Assignee, then order',
      name: 'assigneeOrder',
      by: [
        {field: 'assignee', direction: 'asc'},
        {field: 'displayOrder', direction: 'asc'},
      ],
    },
  ],
  preview: {
    select: {title: 'task', assignee: 'assignee', hours: 'hours'},
    prepare({title, assignee, hours}) {
      return {
        title,
        subtitle: `${assignee || 'Unassigned'} · ${hours || 0} hrs`,
      }
    },
  },
})
