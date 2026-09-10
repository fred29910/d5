import { ErrorBoundary, Suspense, lazy } from 'solid-js'
import type { ParentProps } from 'solid-js'
import { Route, Router } from '@solidjs/router'
import { AppProviders } from './stores/providers.tsx'
import { AuthGuard } from './routes/_components/AuthGuard.tsx'
import { BaseLayout } from './routes/_components/BaseLayout.tsx'

const Home = lazy(() => import('./routes/pages/Home.tsx'))
const Login = lazy(() => import('./routes/pages/Login.tsx'))
const Dashboard = lazy(() => import('./routes/pages/Dashboard.tsx'))
const NotFound = lazy(() => import('./routes/pages/NotFound.tsx'))

function DashboardRoute() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  )
}

function PageLoading() {
  return <p class="p-8 text-center text-sm text-gray-500">Loading…</p>
}

function AppError(err: Error, reset: () => void) {
  return (
    <div class="mx-auto max-w-md p-8 text-center space-y-3">
      <h1 class="text-xl font-medium text-[var(--text-h)]">Something went wrong</h1>
      <p class="text-[var(--text)]">{err.message}</p>
      <button
        type="button"
        onClick={reset}
        class="rounded-[var(--radius-button)] bg-[var(--color-brand-500)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-700)]"
      >
        Try again
      </button>
    </div>
  )
}

function Root(props: ParentProps) {
  return (
    <Suspense fallback={<PageLoading />}>{props.children}</Suspense>
  )
}

function MainLayout(props: ParentProps) {
  return (
    <BaseLayout>
      <Suspense fallback={<PageLoading />}>{props.children}</Suspense>
    </BaseLayout>
  )
}

function LoginLayout(props: ParentProps) {
  return (
    <BaseLayout showNav={false}>
      <Suspense fallback={<PageLoading />}>{props.children}</Suspense>
    </BaseLayout>
  )
}

function App() {
  return (
    <ErrorBoundary fallback={AppError}>
      <AppProviders>
        <Router root={Root}>
          <Route component={MainLayout}>
            <Route path="/" component={Home} />
            <Route path="/dashboard" component={DashboardRoute} />
            <Route path="*404" component={NotFound} />
          </Route>
          <Route component={LoginLayout}>
            <Route path="/login" component={Login} />
          </Route>
        </Router>
      </AppProviders>
    </ErrorBoundary>
  )
}

export default App