import { CollectionConfig } from 'payload'

export const News: CollectionConfig = {
  slug: 'news',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        {
          label: 'Draft',
          value: 'draft',
        },
        {
          label: 'Published',
          value: 'published',
        },
      ],
      defaultValue: 'draft',
      required: true,
    },
    {
      name: 'scheduledPublish',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          timeFormat: 'HH:mm',
          timeIntervals: 1,
          displayFormat: 'yyyy-MM-dd HH:mm',
        },
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (doc.scheduledPublish && doc.status === 'draft') {
          await req.payload.jobs.queue({
            task: 'publishNews',
            input: {
              newsID: doc.id,
            },
            waitUntil: new Date(doc.scheduledPublish),
          })
        }
      },
    ],
  },
}
