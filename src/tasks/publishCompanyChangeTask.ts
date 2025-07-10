import { TaskConfig } from 'payload'

export const publishCompanyChangeTask: TaskConfig<'publishCompanyChange'> = {
  slug: 'publishCompanyChange', // <--- Новый slug
  retries: 2,
  inputSchema: [
    {
      name: 'companyChangeID',
      type: 'text',
      required: true,
    },
  ],
  handler: async ({ input, req }) => {
    const { companyChangeID } = input

    try {
      await req.payload.update({
        collection: 'company-changes', // <--- Обновлённый slug
        id: companyChangeID,
        data: {
          _status: 'published',
          displayDuration: {
            scheduledPublicationDateTime: null,
          },
        },
      })

      req.payload.logger.info(
        `CompanyChange (ID: ${companyChangeID}) was successfully published via scheduled task.`,
      )

      return {
        output: {},
      }
    } catch (error) {
      req.payload.logger.error(`Failed to publish CompanyChange (ID: ${companyChangeID}): ${error}`)

      throw error
    }
  },
}
