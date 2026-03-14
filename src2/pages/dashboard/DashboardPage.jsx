import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { selectUser } from '../../store/slices/authSlice'
import { Button } from '../../components/ui/Button'
import { ROUTES } from '../../config/constants'

export const DashboardPage = () => {
  const user = useSelector(selectUser)

  // Determine user role from unified User model (role: 'owner' | 'tenant' | 'admin')
  const isOwner = user?.role === 'owner'
  const isTenant = user?.role === 'tenant'

  console.log('Dashboard - User role:', user?.role, 'isOwner:', isOwner, 'isTenant:', isTenant)

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
            Welcome back, {user?.firstName || user?.email}!
          </h1>
          <p className="text-lg text-gray-600 font-light max-w-2xl mb-4">
            {isOwner && 'Manage your properties and tenants from your dashboard'}
            {isTenant && 'View your rental information and communicate with your landlord'}
            {user?.role === 'admin' && 'System administration dashboard'}
          </p>
          <div className="mt-4 inline-flex items-center space-x-2 text-sm bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-200 font-medium">
            <span>👤</span>
            <span>Logged in as: <strong>{user?.role}</strong> | {user?.email}</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {isOwner ? (
            <>
              <StatsCard
                title="Total Properties"
                value="12"
                icon="🏠"
                trend="+2 this month"
                trendUp={true}
              />
              <StatsCard
                title="Active Tenants"
                value="28"
                icon="👥"
                trend="+5 this month"
                trendUp={true}
              />
              <StatsCard
                title="Monthly Revenue"
                value="$45,200"
                icon="💰"
                trend="+8% from last month"
                trendUp={true}
              />
              <StatsCard
                title="Maintenance Requests"
                value="3"
                icon="🔧"
                trend="2 pending"
                trendUp={false}
              />
            </>
          ) : (
            <>
              <StatsCard
                title="Current Rent"
                value="$1,800"
                icon="💵"
                trend="Due in 5 days"
                trendUp={false}
              />
              <StatsCard
                title="Lease Duration"
                value="12 months"
                icon="📅"
                trend="Expires Dec 2025"
                trendUp={true}
              />
              <StatsCard
                title="Maintenance"
                value="1"
                icon="🔧"
                trend="Request pending"
                trendUp={false}
              />
              <StatsCard
                title="Property Rating"
                value="4.8/5"
                icon="⭐"
                trend="Great location"
                trendUp={true}
              />
            </>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>⚡</span>
                <span>Quick Actions</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {isOwner ? (
                  <>
                    <ActionCard
                      title="Add New Tenant"
                      description="Register a new tenant to your property"
                      icon="👤"
                      to={ROUTES.ADDTENANT}
                    />
                    <ActionCard
                      title="View All Tenants"
                      description="Manage existing tenant information"
                      icon="👥"
                      to={ROUTES.TENANTS}
                    />
                    <ActionCard
                      title="Tenant Rent History"
                      description="View rental payments and billing history"
                      icon="📊"
                      to={ROUTES.RENT_HISTORY}
                    />
                    <ActionCard
                      title="Maintenance Hub"
                      description="Track and manage maintenance requests"
                      icon="🔧"
                      to="#"
                    />
                  </>
                ) : (
                  <>
                    <ActionCard
                      title="Pay Rent"
                      description="Make your monthly rent payment"
                      icon="💳"
                      to="#"
                    />
                    <ActionCard
                      title="Request Maintenance"
                      description="Submit a maintenance request"
                      icon="🔧"
                      to="#"
                    />
                    <ActionCard
                      title="Contact Landlord"
                      description="Send a message to your property owner"
                      icon="📞"
                      to={ROUTES.CONTACT}
                    />
                    <ActionCard
                      title="Lease Details"
                      description="View your lease agreement"
                      icon="📄"
                      to="#"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>📊</span>
                <span>Recent Activity</span>
              </h2>
              <div className="space-y-3">
                {isOwner ? (
                  <>
                    <ActivityItem
                      title="New tenant application received"
                      description="John Smith applied for Unit 204"
                      time="2 hours ago"
                      type="info"
                    />
                    <ActivityItem
                      title="Maintenance request completed"
                      description="Fixed leaky faucet in Unit 102"
                      time="1 day ago"
                      type="success"
                    />
                    <ActivityItem
                      title="Rent payment received"
                      description="Sarah Johnson paid rent for November"
                      time="2 days ago"
                      type="success"
                    />
                    <ActivityItem
                      title="Property inspection scheduled"
                      description="Annual inspection for Building A"
                      time="3 days ago"
                      type="warning"
                    />
                  </>
                ) : (
                  <>
                    <ActivityItem
                      title="Rent payment processed"
                      description="Your November rent payment was successful"
                      time="5 days ago"
                      type="success"
                    />
                    <ActivityItem
                      title="Maintenance update"
                      description="Your AC repair has been scheduled"
                      time="1 week ago"
                      type="info"
                    />
                    <ActivityItem
                      title="Lease renewal notice"
                      description="Your lease renewal options are available"
                      time="2 weeks ago"
                      type="warning"
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Profile Summary */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>👤</span>
                <span>Profile Summary</span>
              </h3>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                  {user?.firstName?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
              </div>
              <Link to={ROUTES.PROFILE}>
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </Link>
            </div>

            {/* Properties Overview (Owner only) */}
            {isOwner && (
              <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                  <span>🏢</span>
                  <span>Properties Overview</span>
                </h3>
                <div className="space-y-4">
                  <PropertyItem name="Sunset Apartments" units="24 units" occupancy="92%" />
                  <PropertyItem name="Downtown Condos" units="12 units" occupancy="100%" />
                  <PropertyItem name="Garden View Complex" units="36 units" occupancy="86%" />
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Properties
                </Button>
              </div>
            )}

            {/* Notifications */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>🔔</span>
                <span>Notifications</span>
              </h3>
              <div className="space-y-3">
                <NotificationItem
                  message={isOwner ? "Rent due reminder for 3 tenants" : "Rent payment due in 5 days"}
                  time="Today"
                  unread={true}
                />
                <NotificationItem
                  message={isOwner ? "New maintenance request submitted" : "Maintenance update available"}
                  time="Yesterday"
                  unread={false}
                />
                <NotificationItem
                  message={isOwner ? "Property insurance renewal due" : "Monthly newsletter available"}
                  time="2 days ago"
                  unread={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const StatsCard = ({ title, value, icon, trend, trendUp }) => (
  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-blue-200">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">{title}</dt>
        <dd className="text-4xl font-bold text-gray-900 mb-3">{value}</dd>
        <dd className={`text-sm font-medium flex items-center space-x-1 ${trendUp ? 'text-green-600' : 'text-orange-600'}`}>
          <span>{trendUp ? '📈' : '⚠️'}</span>
          <span>{trend}</span>
        </dd>
      </div>
      <div className="text-5xl opacity-50">{icon}</div>
    </div>
  </div>
)

const ActionCard = ({ title, description, icon, to }) => (
  <Link
    to={to}
    className="block p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-400 hover:shadow-lg transition-all duration-300 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-transparent group"
  >
    <div className="flex items-start space-x-4">
      <span className="text-3xl group-hover:scale-125 transition-transform duration-300">{icon}</span>
      <div className="flex-1">
        <h4 className="font-bold text-gray-900 text-lg mb-2">{title}</h4>
        <p className="text-sm text-gray-600 group-hover:text-gray-700">{description}</p>
      </div>
      <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </Link>
)

const ActivityItem = ({ title, description, time, type }) => {
  const typeMap = {
    success: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', icon: '✓' },
    info: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500', icon: 'ℹ' },
    warning: { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500', icon: '!' },
    error: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500', icon: '✕' },
  }

  const colors = typeMap[type] || typeMap.info

  return (
    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-transparent rounded-xl hover:from-gray-100 transition-all duration-200 border border-gray-100 hover:border-gray-200">
      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center font-semibold ${colors.text} text-sm`}>
        {colors.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900">{title}</p>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
        <p className="text-xs text-gray-500 mt-2 font-medium">{time}</p>
      </div>
    </div>
  )
}

const PropertyItem = ({ name, units, occupancy }) => {
  const occupancyNum = parseInt(occupancy)
  const occupancyColor = occupancyNum >= 90 ? 'text-green-600' : occupancyNum >= 70 ? 'text-blue-600' : 'text-orange-600'
  
  return (
    <div className="flex justify-between items-center py-4 px-4 bg-gradient-to-r from-gray-50 to-transparent rounded-xl hover:from-gray-100 transition-all border border-gray-100 hover:border-gray-200">
      <div>
        <p className="text-sm font-bold text-gray-900">{name}</p>
        <p className="text-xs text-gray-500 mt-1 font-medium">{units}</p>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full transition-all duration-300 ${occupancyColor.replace('text-', 'bg-')}`} style={{width: occupancy}}></div>
        </div>
        <span className={`text-sm font-bold ${occupancyColor}`}>{occupancy}</span>
      </div>
    </div>
  )
}

const NotificationItem = ({ message, time, unread }) => (
  <div className={`p-4 rounded-xl transition-all duration-200 border-2 ${unread ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-sm hover:shadow-md' : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 hover:border-gray-300'}`}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className={`text-sm font-medium ${unread ? 'text-gray-900' : 'text-gray-700'}`}>
          {message}
        </p>
        <p className="text-xs text-gray-500 mt-2 font-medium">{time}</p>
      </div>
      {unread && <div className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0 mt-1 shadow-sm" />}
    </div>
  </div>
)