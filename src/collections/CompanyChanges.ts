import { CollectionConfig } from 'payload'
import { CompanyChange } from '../payload-types' // либо переименуйте тип
import { CollectionAfterChangeHook } from 'payload'

const sendMailAfterChange: CollectionAfterChangeHook<CompanyChange> = async ({
  doc,
  req,
  operation,
  previousDoc,
}) => {
  console.log(`Email sent after ${operation} operation on CompanyChanges (ID: ${doc.id})`)
}

export const CompanyChanges: CollectionConfig = {
  slug: 'company-changes',
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
              task: 'publishCompanyChange',
              input: {
                changeID: doc.id,
              },
              waitUntil: new Date(doc.scheduledPublish),
            })

            req.payload.logger.info(
              `Scheduled publication for CompanyChange (ID: ${doc.id}) at ${doc.scheduledPublish}`,
            )
          } catch (error) {
            req.payload.logger.error(
              `Failed to schedule publication for CompanyChange (ID: ${doc.id}): ${error}`,
            )
          }
        }
      },
    ],
  },
}
