import { TaskConfig } from 'payload'

export const publishCompanyChangeTask: TaskConfig<'publishCompanyChange'> = {
  slug: 'publishCompanyChange', // <--- Новый slug
  retries: 2,
  inputSchema: [
    {
      name: 'changeID',
      type: 'text',
      required: true,
    },
  ],
  handler: async ({ input, req }) => {
    const { changeID } = input

    try {
      await req.payload.update({
        collection: 'company-changes', // <--- Обновлённый slug
        id: changeID,
        data: {
          status: 'published',
        },
      })

      req.payload.logger.info(
        `CompanyChange (ID: ${changeID}) was successfully published via scheduled task.`,
      )

      return {
        output: {},
      }
    } catch (error) {
      req.payload.logger.error(`Failed to publish CompanyChange (ID: ${changeID}): ${error}`)

      throw error
    }
  },
}
