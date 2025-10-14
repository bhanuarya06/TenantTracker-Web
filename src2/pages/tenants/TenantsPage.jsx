import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectUserType } from '../../store/slices/authSlice'
import { tenantService } from '../../services/tenantService'
import { Button } from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { USER_TYPES } from '../../config/constants'
import toast from 'react-hot-toast'

const TenantsPage = () => {
  const userType = useSelector(selectUserType)
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(false)
  const isOwner = userType === USER_TYPES.OWNER

  useEffect(() => {
    if (isOwner) {
      loadTenants()
    }
  }, [isOwner])

  // Redirect if not owner
  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">This page is only available to property owners.</p>
        </div>
      </div>
    )
  }

  const loadTenants = async () => {
    try {
      setLoading(true)
      console.log('Fetching tenants...')
      const data = await tenantService.getTenants()
      console.log('Tenants data:', data)
      setTenants(data || [])
      toast.success(`Loaded ${data?.length || 0} tenants`)
    } catch (error) {
      console.error('Load tenants error:', error)
      toast.error('Failed to load tenants: ' + (error.message || 'Unknown error'))
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
            <p className="mt-2 text-gray-600">
              Manage your tenants and their information
            </p>
          </div>
          <Button onClick={loadTenants} variant="outline">
            🔄 Refresh
          </Button>
        </div>

        {/* Tenants Display */}
        {tenants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map((tenant) => (
              <TenantCard key={tenant._id} tenant={tenant} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-6">�</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Tenants Found</h2>
            <p className="text-lg text-gray-600 mb-8">
              {loading ? 'Loading tenants...' : 'No tenants have been added yet.'}
            </p>
            <Button onClick={loadTenants}>
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Tenant Card Component
const TenantCard = ({ tenant }) => (
  <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
          {tenant.firstName?.charAt(0)?.toUpperCase() || 'T'}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">
            {tenant.firstName} {tenant.lastName}
          </h3>
          <p className="text-sm text-gray-600">{tenant.email}</p>
        </div>
      </div>
    </div>

    <div className="space-y-2 text-sm">
      {tenant.mobile && (
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">📞</span>
          <span>{tenant.mobile}</span>
        </div>
      )}
      {tenant.roomNum && (
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">🏠</span>
          <span>Room: {tenant.roomNum}</span>
        </div>
      )}
      {tenant.ocupation && (
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">💼</span>
          <span>{tenant.ocupation}</span>
        </div>
      )}
      {tenant.rent && (
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">💰</span>
          <span>Rent: ₹{tenant.rent}/month</span>
        </div>
      )}
      {tenant.memberCount && (
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">👥</span>
          <span>Members: {tenant.memberCount}</span>
        </div>
      )}
      {tenant.balance && tenant.balance !== "0" && (
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">💳</span>
          <span className={`font-medium ${parseFloat(tenant.balance) < 0 ? 'text-red-600' : 'text-green-600'}`}>
            Balance: ₹{tenant.balance}
          </span>
        </div>
      )}
      {tenant.dob && (
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">🎂</span>
          <span>DOB: {new Date(tenant.dob).toLocaleDateString()}</span>
        </div>
      )}
    </div>

    {tenant.bio && (
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-600 line-clamp-2">{tenant.bio}</p>
      </div>
    )}
  </div>
)

export default TenantsPage