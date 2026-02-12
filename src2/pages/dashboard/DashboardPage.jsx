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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName || user?.email}!
          </h1>
          <p className="text-gray-600 mt-2">
            {isOwner && 'Manage your properties and tenants from your dashboard'}
            {isTenant && 'View your rental information and communicate with your landlord'}
            {user?.role === 'admin' && 'System administration dashboard'}
          </p>
          <div className="mt-2 text-sm text-blue-600">
            Logged in as: {user?.role} | Email: {user?.email}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Recent Activity
              </h2>
              <div className="space-y-4">
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
          <div className="space-y-6">
            {/* Profile Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Profile Summary
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
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Properties Overview
                </h3>
                <div className="space-y-3">
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Notifications
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
  <div className="bg-white rounded-lg shadow-sm p-6">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="ml-4 w-0 flex-1">
        <dl>
          <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
          <dd className="text-2xl font-semibold text-gray-900">{value}</dd>
          <dd className={`text-sm ${trendUp ? 'text-green-600' : 'text-yellow-600'}`}>
            {trend}
          </dd>
        </dl>
      </div>
    </div>
  </div>
)

const ActionCard = ({ title, description, icon, to }) => (
  <Link
    to={to}
    className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
  >
    <div className="flex items-start space-x-3">
      <span className="text-xl">{icon}</span>
      <div>
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  </Link>
)

const ActivityItem = ({ title, description, time, type }) => {
  const typeColors = {
    success: 'bg-green-100 text-green-800',
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  }

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
      <div className={`w-2 h-2 rounded-full mt-2 ${typeColors[type]?.replace('text-', 'bg-').replace('-800', '-600')}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  )
}

const PropertyItem = ({ name, units, occupancy }) => (
  <div className="flex justify-between items-center py-2">
    <div>
      <p className="text-sm font-medium text-gray-900">{name}</p>
      <p className="text-xs text-gray-600">{units}</p>
    </div>
    <span className="text-sm font-medium text-green-600">{occupancy}</span>
  </div>
)

const NotificationItem = ({ message, time, unread }) => (
  <div className={`p-3 rounded-lg ${unread ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
    <p className={`text-sm ${unread ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
      {message}
    </p>
    <p className="text-xs text-gray-500 mt-1">{time}</p>
    {unread && <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />}
  </div>
)