import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Error caught by boundary:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "300px",
                    padding: "2rem",
                    textAlign: "center",
                    gap: "1rem"
                }}>
                    <AlertTriangle size={48} style={{ color: "#ef4444" }} />
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>
                        Something went wrong
                    </h2>
                    <p style={{ color: "#6b7280", maxWidth: "500px" }}>
                        An unexpected error occurred. Please try refreshing the page.
                    </p>
                    {this.state.error && (
                        <details style={{ 
                            marginTop: "1rem", 
                            padding: "1rem", 
                            backgroundColor: "#f3f4f6",
                            borderRadius: "0.375rem",
                            maxWidth: "600px",
                            width: "100%",
                            textAlign: "left"
                        }}>
                            <summary style={{ cursor: "pointer", fontWeight: "500" }}>
                                Error details
                            </summary>
                            <pre style={{ 
                                marginTop: "0.5rem", 
                                fontSize: "0.875rem",
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word"
                            }}>
                                {this.state.error.message}
                            </pre>
                        </details>
                    )}
                    <button
                        onClick={this.handleReset}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.5rem 1rem",
                            backgroundColor: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "0.375rem",
                            cursor: "pointer",
                            fontSize: "1rem",
                            fontWeight: "500"
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = "#2563eb";
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = "#3b82f6";
                        }}
                    >
                        <RefreshCw size={16} />
                        Refresh Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;