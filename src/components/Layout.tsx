import { Outlet } from 'react-router-dom'
import { Navigation } from './Navigation'
import { Breadcrumbs } from './Breadcrumbs'
import { SchemaManagerProvider } from '../hooks/useSchemaManager'
import { SubmissionManagerProvider } from '../hooks/useSubmissionManager'

export function Layout() {
  return (
    <SchemaManagerProvider>
      <SubmissionManagerProvider>
        <div className="min-h-screen bg-gray-50">
          <Navigation />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Breadcrumbs />
            <div className="mt-6">
              <Outlet />
            </div>
          </main>

          <footer className="bg-white border-t border-gray-200 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center text-gray-500 text-sm">
                <p>&copy; 2024 Dynamic Form Builder. Built with React, TypeScript, and Tailwind CSS.</p>
              </div>
            </div>
          </footer>
        </div>
      </SubmissionManagerProvider>
    </SchemaManagerProvider>
  )
}