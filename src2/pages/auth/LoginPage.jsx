import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { selectIsAuthenticated, selectUserType, setUserType } from '../../store/slices/authSlice'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { ROUTES, USER_TYPES, FORM_VALIDATION } from '../../config/constants'

export const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const userType = useSelector(selectUserType)
  const { login, isLoading } = useAuth()

  const [formData, setFormData] = useState({
    email: 'chandra@gmail.com', // Default for testing
    password: 'Chandra@123', // Default for testing
  })
  const [errors, setErrors] = useState({})

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from || ROUTES.DASHBOARD
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!FORM_VALIDATION.EMAIL_REGEX.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < FORM_VALIDATION.PASSWORD_MIN_LENGTH) {
      newErrors.password = `Password must be at least ${FORM_VALIDATION.PASSWORD_MIN_LENGTH} characters`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('LoginPage: Form submitted, preventing default')
    console.log('LoginPage: Form data:', formData)
    
    if (!validateForm()) {
      console.log('LoginPage: Form validation failed')
      return
    }

    try {
      console.log('LoginPage: Calling login with:', formData)
      const result = await login(formData)
      console.log('LoginPage: Login result received:', result)
      
      if (result.success) {
        console.log('LoginPage: Login result success:', result)
        
        // Implement role-based redirect as per API specification
        const user = result.data
        console.log('LoginPage: User data from result:', user)
        
        let redirectPath
        
        if (user.role === 'owner') {
          redirectPath = '/dashboard' // Owner dashboard
        } else if (user.role === 'tenant') {
          redirectPath = '/dashboard' // Tenant dashboard (same route, different data)
        } else {
          // Fallback to default dashboard
          redirectPath = location.state?.from || ROUTES.DASHBOARD
        }
        
        console.log('LoginPage: Redirecting to:', redirectPath, 'for role:', user.role)
        
        // Add a small delay to ensure Redux state is updated
        setTimeout(() => {
          navigate(redirectPath, { replace: true })
        }, 100)
        
      } else {
        console.error('Login failed:', result.error)
      }
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <span className="text-2xl">🏠</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to={ROUTES.REGISTER}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* User Type Selector */}
          <div>
            <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
              Login as
            </label>
            <select
              id="userType"
              value={userType}
              onChange={(e) => dispatch(setUserType(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={USER_TYPES.OWNER}>Property Owner</option>
              <option value={USER_TYPES.TENANT}>Tenant</option>
            </select>
          </div>

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              loading={isLoading}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Sign in'}
            </Button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to={ROUTES.REGISTER}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up here
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}