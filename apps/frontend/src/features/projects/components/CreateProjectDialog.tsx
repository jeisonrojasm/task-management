import { useCreateProject } from '../api/projects.api'

import { ProjectForm } from './ProjectForm'

import type { CreateProjectData } from '../types'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const { mutate, isPending } = useCreateProject()

  function handleSubmit(data: CreateProjectData) {
    mutate(data, {
      onSuccess: () => onOpenChange(false),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo proyecto</DialogTitle>
          <DialogDescription>
            Completa la información para crear un nuevo proyecto.
          </DialogDescription>
        </DialogHeader>
        <ProjectForm onSubmit={handleSubmit} loading={isPending} submitLabel="Crear proyecto" />
      </DialogContent>
    </Dialog>
  )
}
