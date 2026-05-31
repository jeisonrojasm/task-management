import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <Inbox className="h-10 w-10 text-slate-400" />
      <div className="space-y-1">
        <p className="font-medium text-slate-700">{title}</p>
        {description !== undefined && <p className="text-sm text-slate-500">{description}</p>}
      </div>
      {action !== undefined && (
        <button
          onClick={action.onClick}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
