import { z } from 'zod'

export const sendAnonymouslySchema = z.object({
  sendAnonymously: z.boolean(),
});