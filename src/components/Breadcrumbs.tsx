import { Link, useLocation } from 'react-router-dom'

interface BreadcrumbItem {
  name: string
  href?: string
}

const routeNames: Record<string, string> = {
  '/': 'Dashboard',
  '/builder': 'Form Builder',
  '/builder/new': 'New Form',
  '/builder/edit': 'Edit Form',
  '/preview': 'Form Preview',
  '/preview/form': 'Preview Form',
  '/data': 'Data Management',
  '/data/submissions': 'Submissions',
  '/data/analytics': 'Analytics'
}

// Routes that should redirect to parent when clicked
const redirectToParent: Record<string, string> = {
  '/preview/form': '/preview',
  '/builder/edit': '/builder',
  '/builder/new': '/builder',
  '/data/submissions': '/data'
}

export function Breadcrumbs() {
  const location = useLocation()

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [{ name: 'Dashboard', href: '/' }]

    if (pathSegments.length === 0) {
      return [{ name: 'Dashboard' }]
    }

    let currentPath = ''
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === pathSegments.length - 1

      // Get route name or use segment with proper formatting
      const routeName = routeNames[currentPath] || segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      breadcrumbs.push({
        name: routeName,
        href: isLast ? undefined : (redirectToParent[currentPath] || currentPath)
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {breadcrumbs.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <svg
                className="w-4 h-4 text-gray-400 mx-1 md:mx-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}

            {item.href ? (
              <Link
                to={item.href}
                className="text-sm font-medium text-gray-500 hover:text-blue-700 transition-colors"
              >
                {item.name}
              </Link>
            ) : (
              <span className="text-sm font-medium text-gray-900" aria-current="page">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}