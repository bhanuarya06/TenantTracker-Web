import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectUserType } from '../store/slices/authSlice'
import { Button } from '../components/ui/Button'
import { ROUTES, USER_TYPES } from '../config/constants'

export const HomePage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const userType = useSelector(selectUserType)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-40 -mt-40 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full -ml-40 blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10 flex flex-col justify-center">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight">
                Modern Property
                <span className="block bg-gradient-to-r from-cyan-200 to-blue-100 bg-clip-text text-transparent">Management</span>
                <span className="block text-white">Made Simple</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-blue-50 leading-relaxed font-light max-w-xl">
                Streamline your rental business with our comprehensive property management platform. Manage tenants, collect rent, and track maintenance all in one place.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                {isAuthenticated ? (
                  <Link to={ROUTES.DASHBOARD}>
                    <Button size="lg" className="bg-gray-950  text-blue-600 hover:bg-blue-50">
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to={ROUTES.REGISTER}>
                      <Button size="lg" className="bg-gray-950 text-gray-500 hover:bg-blue-50 font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105">
                        Get Started Free →
                      </Button>
                    </Link>
                    <Link to={ROUTES.LOGIN}>
                      <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
            
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-3xl opacity-20 blur-2xl"></div>
              <img
                src="/bg-image.webp"
                alt="Property Management Dashboard"
                className="relative rounded-3xl shadow-2xl border-2 border-white/20 w-full h-auto object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 md:py-40 bg-gradient-to-b from-white via-blue-50 to-white relative mb-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-8 tracking-tight leading-tight">
              Everything You Need to Manage Properties
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed tracking-wide">
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
      <section className="py-32 md:py-40 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white relative overflow-hidden mb-8">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h3 className="text-5xl md:text-6xl font-black text-center mb-6 bg-gradient-to-r from-cyan-300 to-blue-200 bg-clip-text text-transparent tracking-tight">
              Why Choose TenantTracker?
            </h3>
            <p className="text-center text-blue-100 text-lg md:text-xl mb-2 max-w-2xl mx-auto font-light leading-relaxed tracking-wide">Everything you need for successful property management</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 place-items-center">
            <AmenityItem icon="⚡" text="Fast Setup" />
            <AmenityItem icon="🛡️" text="Secure & Reliable" />
            <AmenityItem icon="💵" text="Affordable Plans" />
            <AmenityItem icon="🏢" text="Modern Interface" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="bg-gradient-to-r from-slate-950 via-slate-800 to-blue-900 text-white py-32 md:py-40 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
            <h2 className="text-5xl md:text-6xl font-black mb-8 tracking-tight leading-tight">
              Ready to Transform Your Property Management?
            </h2>
            <p className="text-lg md:text-xl text-blue-100 mb-12 font-light leading-relaxed max-w-2xl mx-auto tracking-wide">
              Join thousands of property owners who trust TenantTracker to manage their rentals efficiently and securely.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
              <Link to={ROUTES.REGISTER}>
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-blue-50 font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                  Start Free Trial →
                </Button>
              </Link>
              <Link to={ROUTES.CONTACT}>
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-indigo-600 font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105">
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
  <div className="group h-full w-full max-w-xs p-8 rounded-2xl bg-gradient-to-br from-white to-blue-50 border-2 border-blue-100 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="relative z-10 flex flex-col h-full">
      <div className="text-6xl mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">{title}</h3>
      <p className="text-gray-700 leading-relaxed font-light opacity-90 group-hover:opacity-100 transition-opacity">{description}</p>
      <div className="mt-auto pt-6">
        <div className="text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">Learn more →</div>
      </div>
    </div>
  </div>
)

const AmenityItem = ({ icon, text }) => (
  <div className="group flex flex-col items-center justify-center p-8 rounded-2xl w-full max-w-xs bg-white/10 backdrop-blur-sm border border-white/20 hover:border-cyan-300/50 hover:bg-white/20 transition-all duration-300 cursor-pointer text-center">
    <span className="text-6xl mb-5 group-hover:scale-125 transition-transform duration-300">{icon}</span>
    <span className="text-lg font-semibold text-white tracking-wide">{text}</span>
  </div>
)