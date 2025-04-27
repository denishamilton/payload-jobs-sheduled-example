// payload.config.ts

import { TaskConfig } from 'payload'

export const publishNewsTask: TaskConfig<'publishNews'> = {
  slug: 'publishNews',
  inputSchema: [
    {
      name: 'newsID',
      type: 'text',
      required: true,
    },
  ],
  handler: async ({ input, req }) => {
    const { newsID } = input

    // Обновляем новость
    await req.payload.update({
      collection: 'news',
      id: newsID,
      data: {
        status: 'published',
      },
    })

    return {
      output: {},
    }
  },
}
