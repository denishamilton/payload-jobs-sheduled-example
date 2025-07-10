import { Field } from 'payload'

export const PublishStatus: Field = {
    name: '_status',
    label: 'Status',
    type: 'radio',
    defaultValue: 'published',
    required: true,
    admin: {
      position: 'sidebar',
    },
    options: [
      {
        label: 'Entwurf',
        value: 'draft',
      },
      {
        label: 'Publiziert',
        value: 'published',
      },
    ]
}
