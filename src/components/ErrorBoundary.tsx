import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends (React.Component as any) {
  constructor(props: any) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: any) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl text-center space-y-8 border border-slate-100 dark:border-slate-800">
            <div className="mx-auto w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-3xl flex items-center justify-center text-red-600">
              <AlertTriangle size={40} />
            </div>
            
            <div className="space-y-3">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Oops! Something went wrong</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                We encountered an unexpected error. Don't worry, your funds are safe.
              </p>
            </div>

            {this.state.error && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-left overflow-hidden">
                <p className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">Error Details</p>
                <p className="text-sm font-bold text-red-500 break-words line-clamp-3">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all active:scale-95"
              >
                <RefreshCw size={20} /> Retry
              </button>
              <button 
                onClick={() => {
                  window.location.href = '/';
                  this.setState({ hasError: false, error: null });
                }}
                className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
              >
                <Home size={20} /> Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
