// ErrorBoundary.jsx
import React, { Component } from "react";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, errorMessage: "" };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, errorMessage: error.message };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Error caught by ErrorBoundary:", error);
        console.error("Error details:", errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ color: "red", padding: "10px", backgroundColor: "#ffeeee" }}>
                    <h2>Something went wrong.</h2>
                    <p>{this.state.errorMessage}</p>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
