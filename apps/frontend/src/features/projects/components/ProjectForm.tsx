import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import { projectSchema, type ProjectFormValues } from '../schemas'

import type { CreateProjectData } from '../types'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

interface ProjectFormProps {
  defaultValues?: Partial<CreateProjectData>
  onSubmit: (data: CreateProjectData) => void
  loading?: boolean
  submitLabel?: string
}

export function ProjectForm({
  defaultValues,
  onSubmit,
  loading = false,
  submitLabel = 'Guardar',
}: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          placeholder="Nombre del proyecto"
          aria-invalid={errors.name !== undefined}
          {...register('name')}
        />
        {errors.name !== undefined && <p className="text-xs text-red-600">{errors.name.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="description">Descripción</Label>
        <textarea
          id="description"
          placeholder="Descripción del proyecto (opcional)"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...register('description')}
        />
        {errors.description !== undefined && (
          <p className="text-xs text-red-600">{errors.description.message}</p>
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
