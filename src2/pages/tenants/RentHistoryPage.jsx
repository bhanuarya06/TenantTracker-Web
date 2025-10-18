import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { selectUserType } from '../../store/slices/authSlice'
import { 
  selectTenants, 
  selectTenantLoading, 
  selectTenantError,
  setLoading,
  setTenants,
  setError
} from '../../store/slices/tenantSlice'
import { tenantService } from '../../services/tenantService'
import { Button } from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { USER_TYPES, ROUTES } from '../../config/constants'
import toast from 'react-hot-toast'

const RentHistoryPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const userType = useSelector(selectUserType)
  const tenants = useSelector(selectTenants)
  const loading = useSelector(selectTenantLoading)
  const error = useSelector(selectTenantError)
  const isOwner = userType === USER_TYPES.OWNER

  const [selectedTenant, setSelectedTenant] = useState(null)
  const [rentHistory, setRentHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    if (isOwner && (!tenants || tenants.length === 0)) {
      loadTenants()
    }
  }, [isOwner]) // eslint-disable-line react-hooks/exhaustive-deps

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
      dispatch(setLoading(true))
      console.log('Fetching tenants...')
      const data = await tenantService.getTenants()
      console.log('Tenants data:', data)
      dispatch(setTenants(data || []))
      toast.success(`Loaded ${data?.length || 0} tenants`)
    } catch (error) {
      console.error('Load tenants error:', error)
      dispatch(setError(error.message || 'Failed to load tenants'))
      toast.error('Failed to load tenants: ' + (error.message || 'Unknown error'))
    }
  }

  const loadRentHistory = async (tenantId) => {
    try {
      setHistoryLoading(true)
      console.log('Fetching rent history for tenant:', tenantId)
      const history = await tenantService.getRentHistory(tenantId)
      console.log('Rent history:', history)
      setRentHistory(history || [])
      toast.success('Rent history loaded successfully')
    } catch (error) {
      console.error('Load rent history error:', error)
      toast.error('Failed to load rent history: ' + (error.message || 'Unknown error'))
      setRentHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleTenantSelect = (tenant) => {
    setSelectedTenant(tenant)
    loadRentHistory(tenant._id)
  }

  const handleBackToTenants = () => {
    setSelectedTenant(null)
    setRentHistory([])
  }

  const handleAddBill = (tenant) => {
    navigate(ROUTES.ADD_BILL(tenant._id))
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
            <h1 className="text-3xl font-bold text-gray-900">
              {selectedTenant ? `${selectedTenant.firstName}'s Rent History` : 'Tenant Rent History'}
            </h1>
            <p className="mt-2 text-gray-600">
              {selectedTenant 
                ? `View detailed billing and payment history for ${selectedTenant.firstName} ${selectedTenant.lastName}`
                : 'Select a tenant to view their rental payment history'
              }
            </p>
          </div>
          {selectedTenant && (
            <Button onClick={handleBackToTenants} variant="outline">
              ← Back to Tenants
            </Button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">⚠️</span>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {!selectedTenant ? (
          // Tenant Selection View
          <>
            {tenants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tenants.map((tenant) => (
                  <TenantCard 
                    key={tenant._id} 
                    tenant={tenant} 
                    onSelect={() => handleTenantSelect(tenant)}
                    onAddBill={handleAddBill}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-6">🏠</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">No Tenants Found</h2>
                <p className="text-lg text-gray-600 mb-8">
                  No tenants have been added yet. Add tenants to view their rent history.
                </p>
                <Button onClick={loadTenants}>
                  Refresh
                </Button>
              </div>
            )}
          </>
        ) : (
          // Rent History View
          <div className="space-y-6">
            {/* Tenant Info Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-medium">
                  {selectedTenant.firstName?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedTenant.firstName} {selectedTenant.lastName}
                  </h3>
                  <p className="text-gray-600">{selectedTenant.email}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span>🏠 Room: {selectedTenant.roomNum}</span>
                    <span>💰 Rent: ₹{selectedTenant.rent}/month</span>
                    <span>👥 Members: {selectedTenant.memberCount}</span>
                    {selectedTenant.balance && selectedTenant.balance !== "0" && (
                      <span className={`font-medium ${parseFloat(selectedTenant.balance) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        Balance: ₹{selectedTenant.balance}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Rent History Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
              </div>
              
              {historyLoading ? (
                <div className="p-8 text-center">
                  <LoadingSpinner size="md" />
                  <p className="text-gray-600 mt-2">Loading rent history...</p>
                </div>
              ) : rentHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Month
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rent
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Additional Bills
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rentHistory.map((bill, index) => (
                        <RentHistoryRow key={index} bill={bill} />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment History</h3>
                  <p className="text-gray-600">No rental payment history found for this tenant.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Tenant Card Component for Selection
const TenantCard = ({ tenant, onSelect, onAddBill }) => (
  <div 
    onClick={onSelect}
    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-gray-200 hover:border-blue-300"
  >
    <div className="flex items-center space-x-4 mb-4">
      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
        {tenant.firstName?.charAt(0)?.toUpperCase() || 'T'}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900">
          {tenant.firstName} {tenant.lastName}
        </h3>
        <p className="text-sm text-gray-600">{tenant.email}</p>
      </div>
      <div className="text-blue-600">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>

    <div className="space-y-2 text-sm text-gray-600">
      <div className="flex justify-between">
        <span>Room:</span>
        <span className="font-medium">{tenant.roomNum}</span>
      </div>
      <div className="flex justify-between">
        <span>Monthly Rent:</span>
        <span className="font-medium">₹{tenant.rent}</span>
      </div>
      <div className="flex justify-between">
        <span>Members:</span>
        <span className="font-medium">{tenant.memberCount}</span>
      </div>
      {tenant.balance && tenant.balance !== "0" && (
        <div className="flex justify-between">
          <span>Balance:</span>
          <span className={`font-medium ${parseFloat(tenant.balance) < 0 ? 'text-red-600' : 'text-green-600'}`}>
            ₹{tenant.balance}
          </span>
        </div>
      )}
    </div>
    
    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
      <p className="text-xs text-blue-600 font-medium">Click to view rent history →</p>
      <Button
        onClick={(e) => {
          e.stopPropagation() // Prevent card click when button is clicked
          onAddBill(tenant)
        }}
        variant="outline"
        size="sm"
        className="w-full"
      >
        + Add New Bill
      </Button>
    </div>
  </div>
)

// Rent History Row Component
const RentHistoryRow = ({ bill }) => {
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'OVERDUE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const additionalBills = [
    { label: 'Water Tank', amount: bill.watertankerBill },
    { label: 'Water', amount: bill.waterBill },
    { label: 'Power', amount: bill.powerBill },
    { label: 'Garbage', amount: bill.garbageBill },
    { label: 'Motor', amount: bill.motorBill },
  ].filter(item => item.amount && parseFloat(item.amount) > 0)

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {bill.month}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ₹{bill.rent}
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        {additionalBills.length > 0 ? (
          <div className="space-y-1">
            {additionalBills.map((item, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span className="text-gray-600">{item.label}:</span>
                <span>₹{item.amount}</span>
              </div>
            ))}
            {bill.balance && parseFloat(bill.balance) !== 0 && (
              <div className="flex justify-between text-xs border-t pt-1">
                <span className="text-gray-600">Previous Balance:</span>
                <span className={parseFloat(bill.balance) < 0 ? 'text-red-600' : 'text-green-600'}>
                  ₹{bill.balance}
                </span>
              </div>
            )}
          </div>
        ) : (
          <span className="text-gray-400">No additional bills</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        ₹{bill.totalBill}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(bill.status)}`}>
          {bill.status?.toUpperCase() || 'UNKNOWN'}
        </span>
      </td>
    </tr>
  )
}

export default RentHistoryPage