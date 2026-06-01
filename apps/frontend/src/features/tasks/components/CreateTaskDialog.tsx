import { useCreateTask } from '../api/tasks.api'

import { TaskForm } from './TaskForm'

import type { CreateTaskData } from '../types'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'

interface CreateTaskDialogProps {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateTaskDialog({ projectId, open, onOpenChange }: CreateTaskDialogProps) {
  const { mutate, isPending } = useCreateTask()

  function handleSubmit(data: CreateTaskData) {
    mutate(data, {
      onSuccess: () => onOpenChange(false),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva tarea</DialogTitle>
          <DialogDescription>Completa la información para crear una nueva tarea.</DialogDescription>
        </DialogHeader>
        <TaskForm
          projectId={projectId}
          onSubmit={handleSubmit}
          loading={isPending}
          submitLabel="Crear tarea"
        />
      </DialogContent>
    </Dialog>
  )
}
