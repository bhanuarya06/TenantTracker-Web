import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { selectTenantById, selectSelectedTenant, setSelectedTenant, setError } from '../../store/slices/tenantSlice'
import { tenantService } from '../../services/tenantService'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Button } from '../../components/ui/Button'
import { ROUTES } from '../../config/constants'
import toast from 'react-hot-toast'

const TenantProfilePage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Try to get tenant from the tenants list first (cached)
  const cachedTenant = useSelector((state) => selectTenantById(state, id))
  const selectedTenant = useSelector(selectSelectedTenant)

  // Use cached tenant from list, or selectedTenant (fetched individually), or null
  const tenant = cachedTenant || selectedTenant

  const [loading, setLocalLoading] = useState(!tenant)

  useEffect(() => {
    // If we already have this tenant's data, store it as selected and skip fetch
    if (cachedTenant) {
      dispatch(setSelectedTenant(cachedTenant))
      return
    }

    // If selectedTenant is already the right one, skip fetch
    if (selectedTenant && selectedTenant._id === id) {
      return
    }

    // Otherwise fetch from backend
    const fetchTenant = async () => {
      try {
        setLocalLoading(true)
        const response = await tenantService.getTenantById(id)
        const tenantData = response.data?.tenant || response.tenant || response.data || response
        dispatch(setSelectedTenant(tenantData))
      } catch (err) {
        console.error('Failed to fetch tenant:', err)
        const msg = err.response?.data?.message || err.message || 'Failed to load tenant details'
        toast.error(msg)
        dispatch(setError(msg))
      } finally {
        setLocalLoading(false)
      }
    }

    fetchTenant()
  }, [id, cachedTenant, selectedTenant, dispatch])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tenant Not Found</h1>
          <p className="text-gray-600 mb-6">The tenant you're looking for could not be found.</p>
          <Button onClick={() => navigate(ROUTES.TENANTS)}>Back to Tenants</Button>
        </div>
      </div>
    )
  }

  const lease = tenant.leaseDetails || {}
  const property = tenant.property || {}
  const address = property.address || {}
  const preferences = tenant.preferences || {}
  const financial = tenant.financialSummary || {}

  const statusColors = {
    active: 'bg-green-100 text-green-800 border-green-200',
    inactive: 'bg-gray-100 text-gray-800 border-gray-200',
    evicted: 'bg-red-100 text-red-800 border-red-200',
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back & Actions */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(ROUTES.TENANTS)}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Tenants</span>
          </button>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => navigate(ROUTES.EDITTENANT(tenant._id))}>
              ✏️ Edit
            </Button>
            <Link to={ROUTES.ADD_BILL(tenant._id)}>
              <Button>📄 Create Bill</Button>
            </Link>
          </div>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {tenant.user?.firstName?.charAt(0)?.toUpperCase() || 'T'}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  {tenant.user?.firstName} {tenant.user?.lastName}
                </h1>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusColors[tenant.status] || statusColors.active}`}>
                  {tenant.status?.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-600">{tenant.user?.email}</p>
              {tenant.user?.phone && (
                <p className="text-gray-500 text-sm mt-1">📞 {tenant.user.phone}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Unit</p>
              <p className="text-2xl font-bold text-blue-600">{tenant.unit || '—'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Property Info */}
          <Section title="🏠 Property">
            <InfoRow label="Name" value={property.name} />
            {address.street && (
              <InfoRow
                label="Address"
                value={[address.street, address.city, address.state, address.zipCode, address.country].filter(Boolean).join(', ')}
              />
            )}
            <InfoRow label="Type" value={property.propertyType} />
            {property.amenities?.length > 0 && (
              <div className="pt-2">
                <p className="text-sm text-gray-500 mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">{a}</span>
                  ))}
                </div>
              </div>
            )}
          </Section>

          {/* Lease Details */}
          <Section title="📋 Lease Details">
            <InfoRow label="Lease Type" value={lease.leaseType} />
            <InfoRow label="Start Date" value={lease.startDate ? new Date(lease.startDate).toLocaleDateString() : null} />
            <InfoRow label="End Date" value={lease.endDate ? new Date(lease.endDate).toLocaleDateString() : null} />
            <InfoRow label="Monthly Rent" value={lease.monthlyRent != null ? `₹${Number(lease.monthlyRent).toLocaleString()}` : null} />
            <InfoRow label="Security Deposit" value={lease.securityDeposit != null ? `₹${Number(lease.securityDeposit).toLocaleString()}` : null} />
          </Section>

          {/* Financial Summary */}
          <Section title="💰 Financial Summary">
            <div className="grid grid-cols-2 gap-4">
              <StatBox label="Total Billed" value={`₹${(financial.totalBilled || 0).toLocaleString()}`} color="blue" />
              <StatBox label="Total Paid" value={`₹${(financial.totalPaid || 0).toLocaleString()}`} color="green" />
              <StatBox label="Outstanding" value={`₹${(financial.outstandingAmount || 0).toLocaleString()}`} color="orange" />
              <StatBox label="Overdue" value={`₹${(financial.overdueAmount || 0).toLocaleString()}`} color="red" />
            </div>
            <div className="mt-3">
              <InfoRow label="Current Balance" value={`₹${(tenant.balance || 0).toLocaleString()}`} />
            </div>
          </Section>

          {/* Personal Info */}
          <Section title="👤 Personal Info">
            <InfoRow label="Gender" value={tenant.user?.gender} />
            <InfoRow label="Date of Birth" value={tenant.user?.dateOfBirth ? new Date(tenant.user.dateOfBirth).toLocaleDateString() : null} />
            {tenant.user?.bio && (
              <div className="pt-2">
                <p className="text-sm text-gray-500 mb-1">Bio</p>
                <p className="text-sm text-gray-800">{tenant.user.bio}</p>
              </div>
            )}
          </Section>

          {/* Occupants */}
          {tenant.occupants?.length > 0 && (
            <Section title="👥 Occupants">
              <div className="space-y-3">
                {tenant.occupants.map((occ, i) => (
                  <div key={occ._id || i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">{occ.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{occ.relationship}</p>
                    </div>
                    {occ.phone && <p className="text-sm text-gray-600">📞 {occ.phone}</p>}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Emergency Contacts */}
          {tenant.emergencyContacts?.length > 0 && (
            <Section title="🚨 Emergency Contacts">
              <div className="space-y-3">
                {tenant.emergencyContacts.map((c, i) => (
                  <div key={c._id || i} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{c.name}</p>
                      {c.isPrimary && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Primary</span>}
                    </div>
                    <p className="text-xs text-gray-500 capitalize">{c.relationship}</p>
                    {c.phone && <p className="text-sm text-gray-600 mt-1">📞 {c.phone}</p>}
                    {c.email && <p className="text-sm text-gray-600">✉️ {c.email}</p>}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Preferences */}
          <Section title="⚙️ Preferences">
            <InfoRow label="Payment Method" value={preferences.paymentMethod} />
            <div className="pt-2">
              <p className="text-sm text-gray-500 mb-2">Notifications</p>
              <div className="flex flex-wrap gap-2">
                {preferences.notifications?.email && <Badge label="Email" />}
                {preferences.notifications?.sms && <Badge label="SMS" />}
                {preferences.notifications?.push && <Badge label="Push" />}
              </div>
            </div>
          </Section>
        </div>

        {/* Metadata */}
        <div className="mt-8 text-xs text-gray-400 flex flex-wrap gap-6">
          {tenant.createdAt && <span>Created: {new Date(tenant.createdAt).toLocaleString()}</span>}
          {tenant.updatedAt && <span>Updated: {new Date(tenant.updatedAt).toLocaleString()}</span>}
        </div>
      </div>
    </div>
  )
}

const Section = ({ title, children }) => (
  <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
    <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
    {children}
  </div>
)

const InfoRow = ({ label, value }) => {
  if (!value) return null
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 capitalize">{value}</span>
    </div>
  )
}

const StatBox = ({ label, value, color }) => {
  const colors = {
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    green: 'bg-green-50 border-green-100 text-green-700',
    orange: 'bg-orange-50 border-orange-100 text-orange-700',
    red: 'bg-red-50 border-red-100 text-red-700',
  }
  return (
    <div className={`p-3 rounded-xl border ${colors[color] || colors.blue}`}>
      <p className="text-xs opacity-75">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  )
}

const Badge = ({ label }) => (
  <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100">
    ✓ {label}
  </span>
)

export default TenantProfilePage
