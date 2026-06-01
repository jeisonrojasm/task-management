import { Component, type ReactNode, type ErrorInfo } from 'react'

import { PageError } from '@/shared/components/PageError'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_error: unknown): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo): void {
    // No frontend logger is configured in this project.
    // The error is communicated to the user via the fallback UI rendered above.
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? <PageError message="Algo salió mal." />
    }
    return this.props.children
  }
}
