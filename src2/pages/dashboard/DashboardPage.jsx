import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { selectUser } from '../../store/slices/authSlice'
import { Button } from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { ROUTES } from '../../config/constants'
import { dashboardService } from '../../services/dashboardService'
import toast from 'react-hot-toast'

export const DashboardPage = () => {
  const user = useSelector(selectUser)
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Determine user role from unified User model (role: 'owner' | 'tenant' | 'admin')
  const isOwner = user?.role === 'owner'
  const isTenant = user?.role === 'tenant'

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await dashboardService.getDashboard()
      console.log('Dashboard data:', response)
      setDashboard(response.data?.dashboard)
    } catch (err) {
      console.error('Failed to load dashboard:', err)
      setError(err.message || 'Failed to load dashboard')
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error && !dashboard) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-red-800 mb-2">Failed to Load Dashboard</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={loadDashboard}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

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
          {isOwner && dashboard?.summary ? (
            <>
              <StatsCard
                title="Total Properties"
                value={dashboard.summary.totalProperties}
                icon="🏠"
                trend={`${dashboard.summary.totalProperties} properties`}
                trendUp={true}
              />
              <StatsCard
                title="Active Tenants"
                value={dashboard.summary.activeTenants}
                icon="👥"
                trend={`${dashboard.summary.activeTenants} of ${dashboard.summary.totalTenants} tenants`}
                trendUp={true}
              />
              <StatsCard
                title="Monthly Revenue"
                value={`$${(dashboard.financial?.monthlyRevenue || 0).toLocaleString()}`}
                icon="💰"
                trend={`Total: $${(dashboard.financial?.totalRevenue || 0).toLocaleString()}`}
                trendUp={true}
              />
              <StatsCard
                title="Outstanding Amount"
                value={`$${(dashboard.financial?.outstandingAmount || 0).toLocaleString()}`}
                icon="⚠️"
                trend={`${dashboard.alerts?.overdueBills || 0} overdue bills`}
                trendUp={false}
              />
            </>
          ) : isTenant && dashboard?.financial ? (
            <>
              <StatsCard
                title="Monthly Rent"
                value={`$${(dashboard.financial?.monthlyRent || 0).toLocaleString()}`}
                icon="💵"
                trend={dashboard.lease?.daysUntilExpiry ? `Expires in ${dashboard.lease.daysUntilExpiry} days` : 'Active lease'}
                trendUp={true}
              />
              <StatsCard
                title="Outstanding Amount"
                value={`$${(dashboard.financial?.outstandingAmount || 0).toLocaleString()}`}
                icon="💳"
                trend={dashboard.financial?.nextPaymentDue ? `Due: ${new Date(dashboard.financial.nextPaymentDue).toLocaleDateString()}` : 'No pending bills'}
                trendUp={dashboard.financial?.outstandingAmount === 0}
              />
              <StatsCard
                title="Lease Duration"
                value={`${dashboard.lease?.daysUntilExpiry || 0} days`}
                icon="📅"
                trend={`Expires: ${dashboard.lease?.endDate ? new Date(dashboard.lease.endDate).toLocaleDateString() : 'N/A'}`}
                trendUp={true}
              />
              <StatsCard
                title="Security Deposit"
                value={`$${(dashboard.financial?.securityDeposit || 0).toLocaleString()}`}
                icon="🏦"
                trend="Held by landlord"
                trendUp={true}
              />
            </>
          ) : (
            <div className="col-span-full text-center text-gray-500">Loading stats...</div>
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
                {isOwner && dashboard?.recentActivity ? (
                  <>
                    {dashboard.recentActivity.tenants && dashboard.recentActivity.tenants.length > 0 ? (
                      dashboard.recentActivity.tenants.map((tenant, idx) => (
                        <ActivityItem
                          key={idx}
                          title={`New tenant added: ${tenant.user?.firstName} ${tenant.user?.lastName}`}
                          description={`Added to ${tenant.property?.name}`}
                          time={new Date(tenant.createdAt).toLocaleDateString()}
                          type="info"
                        />
                      ))
                    ) : null}
                    {dashboard.recentActivity.payments && dashboard.recentActivity.payments.length > 0 ? (
                      dashboard.recentActivity.payments.slice(0, 2).map((payment, idx) => (
                        <ActivityItem
                          key={`payment-${idx}`}
                          title="Rent payment received"
                          description={`Payment of $${payment.amount || 0} received`}
                          time={new Date(payment.createdAt).toLocaleDateString()}
                          type="success"
                        />
                      ))
                    ) : null}
                    {dashboard.recentActivity.bills && dashboard.recentActivity.bills.length > 0 ? (
                      dashboard.recentActivity.bills.slice(0, 1).map((bill, idx) => (
                        <ActivityItem
                          key={`bill-${idx}`}
                          title="Bill generated"
                          description={`Bill of $${bill.totalAmount || 0} for unit ${bill.tenant?.unit}`}
                          time={new Date(bill.createdAt).toLocaleDateString()}
                          type="info"
                        />
                      ))
                    ) : null}
                    {(!dashboard.recentActivity.tenants || dashboard.recentActivity.tenants.length === 0) && 
                     (!dashboard.recentActivity.payments || dashboard.recentActivity.payments.length === 0) && 
                     (!dashboard.recentActivity.bills || dashboard.recentActivity.bills.length === 0) ? (
                      <div className="text-center text-gray-500 py-8">No recent activity yet</div>
                    ) : null}
                  </>
                ) : isTenant && dashboard?.recentActivity ? (
                  <>
                    {dashboard.recentActivity.upcomingBills && dashboard.recentActivity.upcomingBills.length > 0 ? (
                      dashboard.recentActivity.upcomingBills.map((bill, idx) => (
                        <ActivityItem
                          key={idx}
                          title="Bill due"
                          description={`Bill of $${bill.totalAmount || 0} due on ${new Date(bill.dueDate).toLocaleDateString()}`}
                          time={new Date(bill.dueDate).toLocaleDateString()}
                          type="warning"
                        />
                      ))
                    ) : null}
                    {dashboard.recentActivity.payments && dashboard.recentActivity.payments.length > 0 ? (
                      dashboard.recentActivity.payments.map((payment, idx) => (
                        <ActivityItem
                          key={`payment-${idx}`}
                          title="Payment processed"
                          description={`Payment of $${payment.amount || 0} completed`}
                          time={new Date(payment.createdAt).toLocaleDateString()}
                          type="success"
                        />
                      ))
                    ) : null}
                    {(!dashboard.recentActivity.upcomingBills || dashboard.recentActivity.upcomingBills.length === 0) &&
                     (!dashboard.recentActivity.payments || dashboard.recentActivity.payments.length === 0) ? (
                      <div className="text-center text-gray-500 py-8">No recent activity</div>
                    ) : null}
                  </>
                ) : (
                  <div className="text-center text-gray-500 py-8">Loading activities...</div>
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
            {isOwner && dashboard?.summary ? (
              <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                  <span>🏢</span>
                  <span>Properties Overview</span>
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-xl border border-blue-100">
                    <p className="text-sm text-gray-600 font-medium">Total Properties</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{dashboard.summary.totalProperties}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-green-50 to-transparent rounded-xl border border-green-100">
                    <p className="text-sm text-gray-600 font-medium">Occupancy Rate</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {dashboard.summary.totalTenants > 0 
                        ? Math.round(((dashboard.summary.activeTenants / dashboard.summary.totalTenants) * 100)) 
                        : 0}%
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-transparent rounded-xl border border-orange-100">
                    <p className="text-sm text-gray-600 font-medium">Vacant Units</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{dashboard.summary.totalTenants - dashboard.summary.activeTenants}</p>
                  </div>
                </div>
                <Link to={ROUTES.PROPERTIES}>
                  <Button variant="outline" className="w-full mt-4">
                    View All Properties
                  </Button>
                </Link>
              </div>
            ) : null}

            {/* Notifications */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>🔔</span>
                <span>Alerts & Notifications</span>
              </h3>
              <div className="space-y-3">
                {isOwner && dashboard?.alerts ? (
                  <>
                    {dashboard.alerts.overdueBills > 0 ? (
                      <NotificationItem
                        message={`${dashboard.alerts.overdueBills} overdue bills waiting for payment`}
                        time="Urgent"
                        unread={true}
                      />
                    ) : null}
                    {dashboard.alerts.expiringLeases > 0 ? (
                      <NotificationItem
                        message={`${dashboard.alerts.expiringLeases} leases expiring within 30 days`}
                        time="This month"
                        unread={true}
                      />
                    ) : null}
                    {dashboard.alerts.overdueBills === 0 && dashboard.alerts.expiringLeases === 0 ? (
                      <NotificationItem
                        message="All systems operating normally"
                        time="Now"
                        unread={false}
                      />
                    ) : null}
                  </>
                ) : isTenant && dashboard?.financial ? (
                  <>
                    {dashboard.financial.nextPaymentDue ? (
                      <NotificationItem
                        message={`Rent payment due on ${new Date(dashboard.financial.nextPaymentDue).toLocaleDateString()}`}
                        time={`in ${Math.ceil((new Date(dashboard.financial.nextPaymentDue) - new Date()) / (1000 * 60 * 60 * 24))} days`}
                        unread={true}
                      />
                    ) : null}
                    {dashboard.lease?.daysUntilExpiry && dashboard.lease.daysUntilExpiry < 90 ? (
                      <NotificationItem
                        message={`Your lease expires in ${dashboard.lease.daysUntilExpiry} days`}
                        time="Upcoming"
                        unread={true}
                      />
                    ) : null}
                    {!dashboard.financial.nextPaymentDue && (!dashboard.lease?.daysUntilExpiry || dashboard.lease.daysUntilExpiry >= 90) ? (
                      <NotificationItem
                        message="No urgent notifications"
                        time="Now"
                        unread={false}
                      />
                    ) : null}
                  </>
                ) : (
                  <div className="text-center text-gray-500 py-8">Loading notifications...</div>
                )}
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
    success: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', icon: '+' },
    info: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500', icon: 'i' },
    warning: { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500', icon: '!' },
    error: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500', icon: 'x' },
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