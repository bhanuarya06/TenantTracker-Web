import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { ROUTES } from '../config/constants'

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* 404 Illustration */}
        <div className="space-y-6">
          <div className="text-8xl font-bold text-blue-600">404</div>
          <div className="text-6xl">🏠</div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600">
            Sorry, we couldn't find the page you're looking for. 
            The page might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link to={ROUTES.HOME} className="block">
            <Button className="w-full">
              Go Back Home
            </Button>
          </Link>
          
          <Link to={ROUTES.DASHBOARD} className="block">
            <Button variant="outline" className="w-full">
              Go to Dashboard
            </Button>
          </Link>
        </div>

        {/* Help Text */}
        <div className="text-sm text-gray-500">
          <p>
            Need help? {' '}
            <Link 
              to={ROUTES.CONTACT} 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}