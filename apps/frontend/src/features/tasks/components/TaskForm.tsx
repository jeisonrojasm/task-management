import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import { taskSchema, type TaskFormValues } from '../schemas'

import type { CreateTaskData, Priority } from '../types'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'CRITICAL', label: 'Crítica' },
]

interface TaskFormProps {
  projectId: string
  defaultValues?: Partial<TaskFormValues>
  onSubmit: (data: CreateTaskData) => void
  loading?: boolean
  submitLabel?: string
}

export function TaskForm({
  projectId,
  defaultValues,
  onSubmit,
  loading = false,
  submitLabel = 'Guardar',
}: TaskFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      priority: defaultValues?.priority ?? 'MEDIUM',
      dueDate: defaultValues?.dueDate ?? '',
    },
  })

  const priorityValue = watch('priority')

  function handleFormSubmit(values: TaskFormValues) {
    const description =
      values.description !== undefined && values.description !== '' ? values.description : undefined
    const dueDate =
      values.dueDate !== undefined && values.dueDate !== '' ? values.dueDate : undefined

    onSubmit({
      projectId,
      title: values.title,
      ...(description !== undefined ? { description } : {}),
      priority: values.priority,
      ...(dueDate !== undefined ? { dueDate } : {}),
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          placeholder="Título de la tarea"
          aria-invalid={errors.title !== undefined}
          {...register('title')}
        />
        {errors.title !== undefined && (
          <p className="text-xs text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">Descripción</Label>
        <textarea
          id="description"
          placeholder="Descripción de la tarea (opcional)"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...register('description')}
        />
        {errors.description !== undefined && (
          <p className="text-xs text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="priority">Prioridad</Label>
        <Select
          value={priorityValue}
          onValueChange={(val) => {
            const option = PRIORITY_OPTIONS.find((o) => o.value === val)
            if (option !== undefined) {
              setValue('priority', option.value, { shouldValidate: true })
            }
          }}
        >
          <SelectTrigger id="priority">
            <SelectValue placeholder="Selecciona la prioridad" />
          </SelectTrigger>
          <SelectContent>
            {PRIORITY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.priority !== undefined && (
          <p className="text-xs text-red-600">{errors.priority.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="dueDate">Fecha de vencimiento</Label>
        <Input id="dueDate" type="date" {...register('dueDate')} />
        {errors.dueDate !== undefined && (
          <p className="text-xs text-red-600">{errors.dueDate.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
