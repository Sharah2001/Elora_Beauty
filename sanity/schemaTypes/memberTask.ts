import {defineField, defineType} from 'sanity'

export const memberTaskType = defineType({
  name: 'memberTask',
  title: 'Member Tasks',
  type: 'document',
  fields: [
    defineField({
      name: 'memberName',
      title: 'Member Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'memberLabel',
      title: 'Member Label',
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
      name: 'relatedSchemaTypes',
      title: 'Related Schema Types',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'workArea',
      title: 'Work Area',
      type: 'string',
      options: {
        list: ['Frontend', 'Backend', 'Full stack', 'Design system'],
      },
      initialValue: 'Backend',
      validation: (rule) => rule.required(),
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
      title: 'Member, then order',
      name: 'memberOrder',
      by: [
        {field: 'memberName', direction: 'asc'},
        {field: 'displayOrder', direction: 'asc'},
      ],
    },
  ],
  preview: {
    select: {
      title: 'task',
      memberName: 'memberName',
      memberLabel: 'memberLabel',
      workArea: 'workArea',
    },
    prepare({title, memberName, memberLabel, workArea}) {
      return {
        title,
        subtitle: `${memberName || 'Unknown'} - ${memberLabel || 'member'} · ${workArea || 'Work'}`,
      }
    },
  },
})
