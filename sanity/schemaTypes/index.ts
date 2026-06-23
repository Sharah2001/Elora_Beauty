import {type SchemaTypeDefinition} from 'sanity'

import {artistType} from './artist'
import {beforeAfterType} from './beforeAfter'
import {blockedDateType} from './blockedDate'
import {bookingType} from './booking'
import {branchType} from './branch'
import {certificationType} from './certification'
import {contactMessageType} from './contactMessage'
import {faqType} from './faq'
import {galleryItemType} from './galleryItem'
import {offerType} from './offer'
import {packageType} from './package'
import {serviceType} from './service'
import {siteSettingsType} from './siteSettings'
import {testimonialType} from './testimonial'
import {dayScheduleType, workingHoursType} from './workingHours'

export const schema: {types: SchemaTypeDefinition[]} = {
  types: [
    dayScheduleType,
    branchType,
    serviceType,
    artistType,
    workingHoursType,
    packageType,
    offerType,
    bookingType,
    blockedDateType,
    testimonialType,
    contactMessageType,
    faqType,
    galleryItemType,
    beforeAfterType,
    certificationType,
    siteSettingsType,
  ],
}
