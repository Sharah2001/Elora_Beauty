import {defineField} from 'sanity'

export function sourceIdField() {
  return defineField({
    name: 'sourceId',
    title: 'Source ID',
    description: 'Stable website identifier. Do not change after publishing.',
    type: 'string',
    readOnly: ({document}) => Boolean(document?._createdAt),
    validation: (rule) => rule.required(),
  })
}
