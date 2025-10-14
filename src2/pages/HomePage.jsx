import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectUserType } from '../store/slices/authSlice'
import { Button } from '../components/ui/Button'
import { ROUTES, USER_TYPES } from '../config/constants'

export const HomePage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const userType = useSelector(selectUserType)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Modern Property Management
                <span className="block text-blue-200">Made Simple</span>
              </h1>
              
              <p className="text-xl text-blue-100 leading-relaxed">
                Streamline your rental business with our comprehensive property management platform. 
                Manage tenants, collect rent, and track maintenance all in one place.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <Link to={ROUTES.DASHBOARD}>
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to={ROUTES.REGISTER}>
                      <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                        Get Started Free
                      </Button>
                    </Link>
                    <Link to={ROUTES.LOGIN}>
                      <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
            
            <div className="relative">
              <img
                src="/bg-image.webp"
                alt="Property Management Dashboard"
                className="rounded-2xl shadow-2xl"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Properties
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform provides all the tools you need to efficiently manage your rental properties and maintain great relationships with your tenants.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon="🏠"
              title="Property Management"
              description="Organize and track all your rental properties in one centralized dashboard."
            />
            <FeatureCard
              icon="👥"
              title="Tenant Management"
              description="Manage tenant information, lease agreements, and communication efficiently."
            />
            <FeatureCard
              icon="💰"
              title="Rent Collection"
              description="Streamline rent collection with automated reminders and payment tracking."
            />
            <FeatureCard
              icon="🔧"
              title="Maintenance Requests"
              description="Handle maintenance requests and track repairs with our integrated system."
            />
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
            Why Choose TenantTracker?
          </h3>
          
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <AmenityItem icon="⚡" text="Fast Setup" />
            <AmenityItem icon="🛡️" text="Secure & Reliable" />
            <AmenityItem icon="💵" text="Affordable Plans" />
            <AmenityItem icon="🏢" text="Modern Interface" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="bg-blue-600 text-white py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of property owners who trust TenantTracker to manage their rentals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={ROUTES.REGISTER}>
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  Start Free Trial
                </Button>
              </Link>
              <Link to={ROUTES.CONTACT}>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

const FeatureCard = ({ icon, title, description }) => (
  <div className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
)

const AmenityItem = ({ icon, text }) => (
  <div className="flex items-center space-x-3 text-lg font-semibold text-gray-800">
    <span className="text-2xl">{icon}</span>
    <span>{text}</span>
  </div>
)