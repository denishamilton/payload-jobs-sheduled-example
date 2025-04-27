import { CollectionConfig } from 'payload'

export const News: CollectionConfig = {
  slug: 'news',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'text',
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
      defaultValue: 'published',
      required: true,
    },
    {
      name: 'scheduledPublish',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          timeIntervals: 1,
        },
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        if (doc.scheduledPublish && doc.status === 'draft') {
          try {
            await req.payload.jobs.queue({
              task: 'publishNews',
              input: {
                newsID: doc.id,
              },
              waitUntil: new Date(doc.scheduledPublish),
            })

            req.payload.logger.info(
              `Scheduled publication for News (ID: ${doc.id}) at ${doc.scheduledPublish}`,
            )
          } catch (error) {
            req.payload.logger.error(
              `Failed to schedule publication for News (ID: ${doc.id}): ${error}`,
            )
          }
        }
      },
    ],
  },
}
