import { z } from 'zod'

/*
 * Appointment and contact requests from the public site. Shared by the
 * browser forms (step-by-step validation) and the server actions (the
 * authoritative check), so both always agree.
 */

const text = (max: number) => z.string().trim().max(max)
const required = (message: string, max = 120) => text(max).min(1, message)

/** Indian mobile number: 10 digits starting 6-9, optional +91 / 0 prefix and spaces. */
const mobile = () =>
  z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, '').replace(/^(\+91|0)/, ''))
    .refine((v) => /^[6-9]\d{9}$/.test(v), 'Enter a valid 10-digit mobile number')

export const SLOTS = ['Morning', 'Afternoon', 'Evening'] as const
export const GENDERS = ['Female', 'Male', 'Other', 'Prefer not to say'] as const

/** Today in Kochi as YYYY-MM-DD (dates are compared as strings). */
export const kochiDate = (offsetDays = 0) =>
  new Date(Date.now() + offsetDays * 86_400_000).toLocaleDateString('en-CA', {
    timeZone: 'Asia/Kolkata',
  })

export const AppointmentSchema = z.object({
  speciality: text(120),
  doctor: text(120),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a date')
    .refine((d) => d >= kochiDate(), 'Choose today or a later date')
    .refine((d) => d <= kochiDate(90), 'Choose a date within the next 3 months'),
  slot: z.enum(SLOTS, { message: 'Choose a preferred time' }),
  name: required('Enter the patient’s name'),
  phone: mobile(),
  age: z
    .string()
    .trim()
    .regex(/^\d{1,3}$/, 'Enter the patient’s age in years')
    .refine((v) => Number(v) <= 120, 'Enter a valid age'),
  gender: z.union([z.literal(''), z.enum(GENDERS)]),
  reason: text(600),
  consent: z.literal(true, { message: 'Please agree so we can contact you' }),
  /** honeypot: real visitors never see or fill it */
  website: z.string().max(0).optional(),
})
export type AppointmentInput = z.input<typeof AppointmentSchema>

export const TOPICS = [
  'General enquiry',
  'Appointments',
  'Insurance & billing',
  'Dialysis',
  'Feedback',
  'Careers',
] as const

export const MessageSchema = z.object({
  name: required('Enter your name'),
  phone: mobile(),
  email: z.union([z.literal(''), z.string().trim().toLowerCase().email('Enter a valid email')]),
  topic: z.enum(TOPICS, { message: 'Choose a topic' }),
  message: required('Write your message', 2000).min(10, 'Please add a little more detail'),
  consent: z.literal(true, { message: 'Please agree so we can contact you' }),
  website: z.string().max(0).optional(),
})
export type MessageInput = z.input<typeof MessageSchema>

export type RequestResult =
  { ok: true; reference: string } | { ok: false; error: string; fields?: Record<string, string> }
