import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
   <ErrorBoundary fallback={<p>Something went wrong</p>}>
    <App />
    </ErrorBoundary>
  </StrictMode>,
)
