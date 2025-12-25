import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/Button";

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public handleRetry = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload(); // Simple retry strategy: reload page
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <div className="bg-red-100 p-4 rounded-full dark:bg-red-900/20">
                        <AlertTriangle className="w-12 h-12 text-red-500 dark:text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Algo deu errado
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md">
                        Ocorreu um erro inesperado. Tente recarregar a página ou contate o suporte se o problema persistir.
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs text-left w-full max-w-md overflow-auto font-mono text-red-500">
                        {this.state.error?.message}
                    </div>
                    <Button onClick={this.handleRetry} className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Tentar Novamente
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
