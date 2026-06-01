import { z } from 'zod'

export const projectSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(255, 'El nombre no puede superar 255 caracteres'),
  description: z.string().max(1000, 'La descripción no puede superar 1000 caracteres').optional(),
})

export type ProjectFormValues = z.infer<typeof projectSchema>
