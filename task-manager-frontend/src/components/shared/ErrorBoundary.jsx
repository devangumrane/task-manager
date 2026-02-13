import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-6 text-center">
                    <div className="bg-red-500/10 p-4 rounded-full mb-6">
                        <AlertTriangle size={64} className="text-red-500" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
                    <p className="text-muted-foreground mb-8 max-w-md">
                        We're sorry, but an unexpected error occurred. Please try refreshing the page.
                    </p>

                    {this.state.error && (
                        <div className="w-full max-w-2xl bg-black/20 rounded-lg p-4 mb-8 overflow-auto text-left">
                            <p className="text-red-400 font-mono text-sm mb-2">{this.state.error.toString()}</p>
                            <pre className="text-muted-foreground font-mono text-xs whitespace-pre-wrap">
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </div>
                    )}

                    <button
                        onClick={this.handleReload}
                        className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                    >
                        <RefreshCcw size={20} />
                        Refresh Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
