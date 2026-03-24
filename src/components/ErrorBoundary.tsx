import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-4 border border-red-500/50 bg-red-500/10 rounded-lg text-red-500 text-sm flex flex-col items-center justify-center h-full w-full">
          <p className="font-bold mb-2">Component Error</p>
          <p className="text-xs opacity-80 text-center">{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <button 
            className="mt-4 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded transition-colors"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
