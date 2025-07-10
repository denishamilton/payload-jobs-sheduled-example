import { CollectionConfig } from 'payload'
import { CompanyChange } from '../payload-types' // либо переименуйте тип
import { CollectionAfterChangeHook } from 'payload'
import { DisplayDurationGroup } from '@/fields/displayDurationGroup'
import { PublishStatus } from '@/fields/publishStatus'

const sendMailAfterChange: CollectionAfterChangeHook<CompanyChange> = async ({
  doc,
  req,
  operation,
  previousDoc,
}) => {
  if (operation === 'create' && doc._status === 'published') {
    req.payload.logger.info('New CompanyChange published:', doc.id)

    try {
      req.payload.email.sendEmail({
        to: 'denys.gorozhanin@bela.de',
        subject: `New CompanyChange (${doc.id}) published`,
        text: `A new CompanyChange has been published with the title: ${doc.title}\n\nContent:\n${doc.content}`,
      })
      req.payload.logger.info('Email sent successfully.')
    } catch (error) {
      req.payload.logger.error('Failed to send email:', error)
    }
  }

  if (operation === 'update' && doc._status === 'published' && previousDoc?._status === 'draft') {
    req.payload.logger.info('CompanyChange updated and published:', doc.id)

    try {
      req.payload.email.sendEmail({
        to: 'denys.gorozhanin@bela.de',
        subject: `CompanyChange (${doc.id}) updated and published`,
        text: `The CompanyChange has been updated with the title: ${doc.title}\n\nContent:\n${doc.content}`,
      })
      req.payload.logger.info('Email sent successfully.')
    } catch (error) {
      req.payload.logger.error('Failed to send email:', error)
    }
  }
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

    PublishStatus,

    // {
    //   name: 'scheduledPublish',
    //   type: 'date',
    //   admin: {
    //     date: {
    //       pickerAppearance: 'dayAndTime',
    //       timeIntervals: 1,
    //     },
    //   },
    // },

    DisplayDurationGroup,
  ],
  hooks: {
    afterChange: [
      async ({ doc, req, previousDoc }) => {
        if (doc.displayDuration.scheduledPublicationDateTime && doc._status === 'draft') {
          try {
            // Ищем существующую задачу для этого companyChangeID, которая ещё не завершена
            const existingJobs = await req.payload.find({
              collection: 'payload-jobs',
              where: {
                'input.companyChangeID': { equals: doc.id },
                completedAt: { equals: null },
                hasError: { equals: false },
              },
              limit: 1,
            })

            const existingJob = existingJobs.docs[0]

            if (existingJob) {
              // Обновляем дату выполнения (waitUntil)
              await req.payload.update({
                collection: 'payload-jobs',
                id: existingJob.id,
                data: {
                  waitUntil: new Date(
                    doc.displayDuration.scheduledPublicationDateTime,
                  ).toISOString(),
                },
              })

              req.payload.logger.info(
                `Updated existing scheduled publication for CompanyChange (ID: ${doc.id}) to new date: ${doc.displayDuration.scheduledPublicationDateTime}`,
              )
            } else {
              // Задачи нет — создаём новую
              await req.payload.jobs.queue({
                task: 'publishCompanyChange',
                queue: 'companyChangePublishing',
                input: {
                  companyChangeID: doc.id,
                },
                waitUntil: new Date(doc.displayDuration.scheduledPublicationDateTime),
              })

              req.payload.logger.info(
                `Scheduled new publication for CompanyChange (ID: ${doc.id}) at ${doc.displayDuration.scheduledPublicationDateTime}`,
              )
            }
          } catch (error) {
            req.payload.logger.error(
              `Failed to schedule/update publication for CompanyChange (ID: ${doc.id}): ${error}`,
            )
          }
        }
      },

      sendMailAfterChange,
    ],
  },
}
