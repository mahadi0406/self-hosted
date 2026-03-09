import '../css/app.css'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif', gap: '1rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Something went wrong.</h2>
                    <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', background: '#18181b', color: '#fff', border: 'none', cursor: 'pointer' }}>
                        Reload Page
                    </button>
                </div>
            )
        }
        return this.props.children
    }
}

createInertiaApp({
    resolve: name => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true })
        return pages[`./Pages/${name}.jsx`]
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <ErrorBoundary>
                <App {...props} />
            </ErrorBoundary>
        )
    },
    progress: {
        color: '#1f2937',
        includeCSS: true,
        showSpinner: false,
    }
})
