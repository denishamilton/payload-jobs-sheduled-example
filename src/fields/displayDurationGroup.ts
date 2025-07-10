import { FieldHook, Field, APIError } from 'payload'

// BeforeValidation hook для проверки, что scheduledPublicationDateTime < scheduledExpirationDateTime
const checkScheduledPublicationDateTime: FieldHook = async ({ data }) => {
  if (
    data?.displayDuration?.scheduledPublicationDateTime &&
    data?.displayDuration?.scheduledExpirationDateTime
  ) {
    if (
      data.displayDuration.scheduledPublicationDateTime >
      data.displayDuration.scheduledExpirationDateTime
    ) {
      throw new APIError(
        'Geplantes Veröffentlichungsdatum kann nicht nach dem geplanten Ablaufdatum liegen',
        400,
      )
    }
  }
}
export const DisplayDurationGroup: Field = {
  type: 'group',
  label: 'Anzeigedauer - optional',
  name: 'displayDuration',
  hooks: {
    beforeValidate: [checkScheduledPublicationDateTime],
  },
  admin: {
    description:
      'Optional - Wenn Sie ein Veröffentlichungsdatum und/oder ein Ablaufdatum festlegen, wird dieser Beitrag automatisch veröffentlicht und/oder ausgeblendet.',
    position: 'sidebar',
  },
  fields: [
    {
      name: 'scheduledPublicationDateTime',
      label: 'Geplantes Veröffentlichungsdatum',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          timeIntervals: 1,
          minDate: new Date(),
        },
      },
    },

    {
      name: 'scheduledExpirationDateTime',
      label: 'Geplantes Ablaufdatum',
      type: 'date',

      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          timeIntervals: 15,
          minDate: new Date(),
        },
      },
    },
  ],
}
