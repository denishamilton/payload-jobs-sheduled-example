import { TaskConfig } from 'payload'

export const publishNewsTask: TaskConfig<'publishNews'> = {
  slug: 'publishNews',
  retries: 2,
  inputSchema: [
    {
      name: 'newsID',
      type: 'text',
      required: true,
    },
  ],
  handler: async ({ input, req }) => {
    const { newsID } = input

    try {
      await req.payload.update({
        collection: 'news',
        id: newsID,
        data: {
          status: 'published',
        },
      })

      req.payload.logger.info(`News (ID: ${newsID}) was successfully published via scheduled task.`)

      return {
        output: {},
      }
    } catch (error) {
      req.payload.logger.error(`Failed to publish News (ID: ${newsID}): ${error}`)

      throw error
    }
  },
}
