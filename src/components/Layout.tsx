import { Outlet } from 'react-router-dom'
import { Navigation } from './Navigation'
import { Breadcrumbs } from './Breadcrumbs'
import { SchemaManagerProvider } from '../hooks/useSchemaManager'
import { SubmissionManagerProvider } from '../hooks/useSubmissionManager'

export function Layout() {
  return (
    <SchemaManagerProvider>
      <SubmissionManagerProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navigation />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            <Breadcrumbs />
            <div className="mt-4 sm:mt-6">
              <Outlet />
            </div>
          </main>

          <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-8 sm:mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
                <p>&copy; 2025 Dynamic Form Builder.</p>
              </div>
            </div>
          </footer>
        </div>
      </SubmissionManagerProvider>
    </SchemaManagerProvider>
  )
}