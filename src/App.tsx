import { ErrorBoundary, Suspense, lazy } from 'solid-js'
import type { ParentProps } from 'solid-js'
import { Route, Router } from '@solidjs/router'
import { AppProviders } from './stores/providers.tsx'
import { AuthGuard } from './routes/_components/AuthGuard.tsx'
import { Layout } from './routes/_components/Layout.tsx'

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
  return <p>Loading…</p>
}

function AppError(err: Error, reset: () => void) {
  return (
    <div>
      <h1>Something went wrong</h1>
      <p>{err.message}</p>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </div>
  )
}

function Root(props: ParentProps) {
  return (
    <Layout>
      <Suspense fallback={<PageLoading />}>{props.children}</Suspense>
    </Layout>
  )
}

function App() {
  return (
    <ErrorBoundary fallback={AppError}>
      <AppProviders>
        <Router root={Root}>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/dashboard" component={DashboardRoute} />
          <Route path="*404" component={NotFound} />
        </Router>
      </AppProviders>
    </ErrorBoundary>
  )
}

export default App
