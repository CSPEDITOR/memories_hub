import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from '@/context/ThemeContext.jsx'
import { AuthProvider } from '@/context/AuthContext.jsx'
import { SocketProvider } from '@/context/SocketContext.jsx'
import { MusicProvider } from '@/context/MusicContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter >
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider>
              <MusicProvider>
                <App />
              </MusicProvider>
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
)
