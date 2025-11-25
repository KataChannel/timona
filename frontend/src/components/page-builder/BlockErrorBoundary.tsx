'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  blockId?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary for individual block rendering
 * Handles errors during block component rendering and block-specific operations
 */
export class BlockErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Block Error (ID: ${this.props.blockId}):`, error);
      console.error('Component Stack:', errorInfo.componentStack);
    }

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-3 bg-orange-50 border border-orange-200 rounded">
          <div className="flex gap-2 items-start">
            <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-orange-900 text-sm">
                Block Render Error
                {this.props.blockId && ` (${this.props.blockId})`}
              </p>
              <p className="text-xs text-orange-800 mt-0.5">
                {this.state.error?.message || 'Failed to render this block'}
              </p>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-1">
                  <summary className="text-xs text-orange-700 cursor-pointer">
                    Details
                  </summary>
                  <pre className="text-xs mt-1 p-2 bg-white rounded overflow-auto max-h-24">
                    {this.state.error?.toString()}
                  </pre>
                </details>
              )}
              <button
                onClick={this.handleReset}
                className="mt-2 text-xs px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default BlockErrorBoundary;
