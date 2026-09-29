import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from '@/components/ui/toast'
import { TooltipProvider } from '@/components/ui/tooltip'
import { isUnauthorizedError } from '@/lib/api-client'
import { getErrorMessage } from '@/lib/get-error-message'
import { toast } from '@/lib/toast'
import './index.css'
import App from './App.tsx'

// 401 đã được interceptor báo bằng toast "hết hạn phiên", không báo lại.
function reportError(error: unknown) {
  if (isUnauthorizedError(error)) return
  toast.error(getErrorMessage(error))
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: reportError }),
  mutationCache: new MutationCache({ onError: reportError }),
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>
          <TooltipProvider>
            <App />
          </TooltipProvider>
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
