// storage-adapter-import-placeholder
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { publishCompanyChangeTask } from './tasks/publishCompanyChangeTask'
import { CompanyChanges } from './collections/CompanyChanges'

import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import nodemailer from 'nodemailer'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, CompanyChanges],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  db: postgresAdapter({
    // Postgres-specific arguments go here.
    // `pool` is required.
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
  }),

  sharp,
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
  jobs: {
    tasks: [publishCompanyChangeTask],
    autoRun: [
      {
        cron: '*/1 * * * *',
        limit: 50,
        queue: 'companyChangePublishing',
      },
    ],
  },

  email:
    process.env.SMTP_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS
      ? nodemailerAdapter({
          defaultFromAddress: '<blackboard@bela.de>',
          defaultFromName: 'Blackboard',
          transport: nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: 465,
            secure: true,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          }),
        })
      : undefined,
})
