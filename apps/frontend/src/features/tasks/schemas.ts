import { z } from 'zod'

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es obligatorio')
    .max(255, 'El título no puede superar 255 caracteres'),
  description: z.string().max(2000, 'La descripción no puede superar 2000 caracteres').optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  dueDate: z
    .string()
    .optional()
    .refine((val) => val === undefined || val === '' || /^\d{4}-\d{2}-\d{2}$/.test(val), {
      message: 'Formato de fecha inválido',
    }),
})

export type TaskFormValues = z.infer<typeof taskSchema>
