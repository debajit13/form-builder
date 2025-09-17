import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { storage } from '../utils/storage'
import { LoadingSpinner, LoadingCard } from '../components/LoadingSpinner'
import type { FormSchema, FormSubmission } from '../types/schema'

interface DashboardStats {
  totalForms: number
  totalSubmissions: number
  draftForms: number
  recentActivity: number
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentForms, setRecentForms] = useState<FormSchema[]>([])
  const [recentSubmissions, setRecentSubmissions] = useState<FormSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Simulate loading delay for better UX
        await new Promise(resolve => setTimeout(resolve, 800))

        const forms = storage.getSchemas()
        const submissions = storage.getSubmissions()

        // Calculate stats
        const dashboardStats: DashboardStats = {
          totalForms: forms.length,
          totalSubmissions: submissions.length,
          draftForms: forms.filter(form => form.metadata.status === 'draft').length,
          recentActivity: submissions.filter(sub => {
            const submittedAt = new Date((sub as any).submittedAt || (sub as any).metadata?.submittedAt)
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            return submittedAt > weekAgo
          }).length
        }

        // Get recent forms (last 5)
        const sortedForms = [...forms]
          .sort((a, b) => new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime())
          .slice(0, 5)

        // Get recent submissions (last 5)
        const sortedSubmissions = [...submissions]
          .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
          .slice(0, 5)

        setStats(dashboardStats)
        setRecentForms(sortedForms)
        setRecentSubmissions(sortedSubmissions as any)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-8 bg-gray-200 rounded shimmer w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded shimmer w-96"></div>
        </div>

        {/* Stats loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <LoadingCard key={i} className="p-6" />
          ))}
        </div>

        {/* Content loading */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <LoadingCard />
          <LoadingCard />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to your form builder dashboard. Create, manage, and analyze your forms.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Forms"
          value={stats?.totalForms || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          color="blue"
        />
        <StatCard
          title="Total Submissions"
          value={stats?.totalSubmissions || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
          color="green"
        />
        <StatCard
          title="Draft Forms"
          value={stats?.draftForms || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          }
          color="orange"
        />
        <StatCard
          title="Recent Activity"
          value={stats?.recentActivity || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard
            title="Create New Form"
            description="Start building a new form from scratch"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
            href="/builder/new"
            color="blue"
          />
          <QuickActionCard
            title="View All Forms"
            description="Browse and manage existing forms"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
            href="/builder"
            color="green"
          />
          <QuickActionCard
            title="View Submissions"
            description="Analyze form responses and data"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            href="/data"
            color="purple"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Forms */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Forms</h2>
            <Link
              to="/builder"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all →
            </Link>
          </div>

          {recentForms.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No forms created yet</p>
              <Link
                to="/builder/new"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create your first form
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentForms.map((form) => (
                <div
                  key={form.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{form.title}</h3>
                    <p className="text-sm text-gray-500">
                      Updated {new Date(form.metadata.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/preview/form/${form.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Preview
                    </Link>
                    <Link
                      to={`/builder/edit/${form.id}`}
                      className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Submissions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Submissions</h2>
            <Link
              to="/data"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all →
            </Link>
          </div>

          {recentSubmissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p>No submissions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Form Submission</h3>
                    <p className="text-sm text-gray-500">
                      {new Date((submission as any).submittedAt || (submission as any).metadata?.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      (submission as any).status === 'complete'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {(submission as any).status}
                    </span>
                    <Link
                      to={`/data/submissions/${submission.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'orange' | 'purple'
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}

interface QuickActionCardProps {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  color: 'blue' | 'green' | 'purple'
}

function QuickActionCard({ title, description, icon, href, color }: QuickActionCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 group-hover:bg-green-100',
    purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100'
  }

  return (
    <Link
      to={href}
      className="group block p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 hover:border-gray-300"
    >
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]} transition-colors`}>
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </Link>
  )
}