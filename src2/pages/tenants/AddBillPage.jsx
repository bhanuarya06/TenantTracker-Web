import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { selectUserType } from '../../store/slices/authSlice'
import { selectTenants, setLoading, setError } from '../../store/slices/tenantSlice'
import { tenantService } from '../../services/tenantService'
import { Button } from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { USER_TYPES, ROUTES } from '../../config/constants'
import toast from 'react-hot-toast'

const AddBillPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id } = useParams() // tenant ID
  const userType = useSelector(selectUserType)
  const tenants = useSelector(selectTenants)
  const isOwner = userType === USER_TYPES.OWNER
  
  const tenant = tenants.find(t => t._id === id)
  
  const [formData, setFormData] = useState({
    month: new Date().toLocaleString('default', { month: 'long' }),
    watertankerBill: '',
    waterBill: '',
    powerBill: '',
    garbageBill: '',
    motorBill: '',
    status: 'ADD', // ADD = PENDING, PAID = PAID
  })

  const [loading, setLocalLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [calculatedTotal, setCalculatedTotal] = useState(0)

  // Calculate total whenever form data changes
  useEffect(() => {
    if (!tenant) return // Guard clause for when tenant is not found
    
    const rent = parseFloat(tenant.rent) || 0
    const balance = parseFloat(tenant.balance) || 0
    const memberCount = parseFloat(tenant.memberCount) || 1

    // Calculate bills (per member for water tank and motor)
    const watertankerBill = formData.watertankerBill ? parseFloat(formData.watertankerBill) / memberCount : 0
    const motorBill = formData.motorBill ? parseFloat(formData.motorBill) / memberCount : 0
    const waterBill = parseFloat(formData.waterBill) || 0
    const powerBill = parseFloat(formData.powerBill) || 0
    const garbageBill = parseFloat(formData.garbageBill) || 0

    const total = rent + balance + watertankerBill + motorBill + waterBill + powerBill + garbageBill
    setCalculatedTotal(total)
  }, [formData, tenant])

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

  // If tenant not found
  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Tenant Not Found</h1>
          <p className="text-gray-600">The tenant you are trying to create a bill for could not be found.</p>
          <Button onClick={() => navigate(ROUTES.RENT_HISTORY)} className="mt-4">
            Back to Rent History
          </Button>
        </div>
      </div>
    )
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Month is required
    if (!formData.month.trim()) {
      newErrors.month = 'Month is required'
    }

    // Validate numeric fields (optional but must be valid numbers if provided)
    const numericFields = ['watertankerBill', 'waterBill', 'powerBill', 'garbageBill', 'motorBill']
    numericFields.forEach(field => {
      if (formData[field] && (isNaN(formData[field]) || parseFloat(formData[field]) < 0)) {
        newErrors[field] = 'Must be a valid positive number'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors')
      return
    }

    try {
      setLocalLoading(true)
      dispatch(setLoading(true))
      
      // Prepare bill data
      const billData = {
        _id: tenant._id,
        month: formData.month,
        watertankerBill: formData.watertankerBill || 0,
        waterBill: formData.waterBill || 0,
        powerBill: formData.powerBill || 0,
        garbageBill: formData.garbageBill || 0,
        motorBill: formData.motorBill || 0,
        status: formData.status
      }
      
      console.log('Creating bill:', billData)
      const result = await tenantService.createBill(billData)
      console.log('Bill created successfully:', result)
      
      toast.success('Bill created successfully!')
      
      // Navigate back to rent history
      navigate(ROUTES.RENT_HISTORY)
      
    } catch (error) {
      console.error('Create bill error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create bill'
      dispatch(setError(errorMessage))
      toast.error(errorMessage)
    } finally {
      setLocalLoading(false)
      dispatch(setLoading(false))
    }
  }

  const handleCancel = () => {
    navigate(ROUTES.RENT_HISTORY)
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back to Rent History
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">
            Create Bill for {tenant.firstName} {tenant.lastName}
          </h1>
          <p className="text-gray-600 mt-2">
            Add utility bills and charges for this tenant
          </p>
        </div>

        {/* Tenant Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
              {tenant.firstName?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {tenant.firstName} {tenant.lastName}
              </h3>
              <p className="text-gray-600">{tenant.email}</p>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                <span>🏠 Room: {tenant.roomNum}</span>
                <span>💰 Base Rent: ₹{tenant.rent}</span>
                <span>👥 Members: {tenant.memberCount}</span>
                {tenant.balance && tenant.balance !== "0" && (
                  <span className={`font-medium ${parseFloat(tenant.balance) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    Balance: ₹{tenant.balance}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bill Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Month Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month *
              </label>
              <select
                name="month"
                value={formData.month}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.month ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              >
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              {errors.month && <p className="text-red-500 text-sm mt-1">{errors.month}</p>}
            </div>

            {/* Utility Bills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Water Tank Bill */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Water Tank Bill (Total Amount)
                </label>
                <input
                  type="number"
                  name="watertankerBill"
                  value={formData.watertankerBill}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.watertankerBill ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Will be divided by {tenant.memberCount} members = ₹{formData.watertankerBill ? (parseFloat(formData.watertankerBill) / parseFloat(tenant.memberCount)).toFixed(2) : '0'} per member
                </p>
                {errors.watertankerBill && <p className="text-red-500 text-sm mt-1">{errors.watertankerBill}</p>}
              </div>

              {/* Water Bill */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Water Bill
                </label>
                <input
                  type="number"
                  name="waterBill"
                  value={formData.waterBill}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.waterBill ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
                {errors.waterBill && <p className="text-red-500 text-sm mt-1">{errors.waterBill}</p>}
              </div>

              {/* Power Bill */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Power Bill
                </label>
                <input
                  type="number"
                  name="powerBill"
                  value={formData.powerBill}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.powerBill ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
                {errors.powerBill && <p className="text-red-500 text-sm mt-1">{errors.powerBill}</p>}
              </div>

              {/* Garbage Bill */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Garbage Bill
                </label>
                <input
                  type="number"
                  name="garbageBill"
                  value={formData.garbageBill}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.garbageBill ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
                {errors.garbageBill && <p className="text-red-500 text-sm mt-1">{errors.garbageBill}</p>}
              </div>

              {/* Motor Bill */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motor Bill (Total Amount)
                </label>
                <input
                  type="number"
                  name="motorBill"
                  value={formData.motorBill}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.motorBill ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Will be divided by {tenant.memberCount} members = ₹{formData.motorBill ? (parseFloat(formData.motorBill) / parseFloat(tenant.memberCount)).toFixed(2) : '0'} per member
                </p>
                {errors.motorBill && <p className="text-red-500 text-sm mt-1">{errors.motorBill}</p>}
              </div>
            </div>

            {/* Bill Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bill Status
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="ADD"
                    checked={formData.status === 'ADD'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span>Add as Pending</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="PAID"
                    checked={formData.status === 'PAID'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span>Mark as Paid</span>
                </label>
              </div>
            </div>

            {/* Bill Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Bill Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base Rent:</span>
                  <span>₹{tenant.rent}</span>
                </div>
                {tenant.balance && tenant.balance !== "0" && (
                  <div className="flex justify-between">
                    <span>Previous Balance:</span>
                    <span className={parseFloat(tenant.balance) < 0 ? 'text-red-600' : 'text-green-600'}>
                      ₹{tenant.balance}
                    </span>
                  </div>
                )}
                {formData.watertankerBill && (
                  <div className="flex justify-between">
                    <span>Water Tank (per member):</span>
                    <span>₹{(parseFloat(formData.watertankerBill) / parseFloat(tenant.memberCount)).toFixed(2)}</span>
                  </div>
                )}
                {formData.waterBill && (
                  <div className="flex justify-between">
                    <span>Water:</span>
                    <span>₹{formData.waterBill}</span>
                  </div>
                )}
                {formData.powerBill && (
                  <div className="flex justify-between">
                    <span>Power:</span>
                    <span>₹{formData.powerBill}</span>
                  </div>
                )}
                {formData.garbageBill && (
                  <div className="flex justify-between">
                    <span>Garbage:</span>
                    <span>₹{formData.garbageBill}</span>
                  </div>
                )}
                {formData.motorBill && (
                  <div className="flex justify-between">
                    <span>Motor (per member):</span>
                    <span>₹{(parseFloat(formData.motorBill) / parseFloat(tenant.memberCount)).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-medium text-lg">
                  <span>Total Amount:</span>
                  <span>₹{calculatedTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                loading={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Creating...</span>
                  </div>
                ) : (
                  'Create Bill'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddBillPage