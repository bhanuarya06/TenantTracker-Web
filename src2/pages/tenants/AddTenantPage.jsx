import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { selectUserType } from '../../store/slices/authSlice'
import { addTenant, updateTenant, setLoading, setError, selectTenants } from '../../store/slices/tenantSlice'
import { tenantService } from '../../services/tenantService'
import { Button } from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { USER_TYPES, ROUTES } from '../../config/constants'
import toast from 'react-hot-toast'

const AddTenantPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id } = useParams()
  const userType = useSelector(selectUserType)
  const tenants = useSelector(selectTenants)
  const isOwner = userType === USER_TYPES.OWNER
  const isEditMode = !!id
  const tenant = isEditMode ? tenants.find(t => t._id === id) : null

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    mobile: '',
    dob: '',
    gender: '',
    ocupation: '',
    bio: '',
    roomNum: '',
    rent: '',
    balance: '0',
    memberCount: '1',
  })

  const [loading, setLocalLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Initialize form data for edit mode
  useEffect(() => {
    if (isEditMode && tenant) {
      setFormData({
        firstName: tenant.firstName || '',
        lastName: tenant.lastName || '',
        email: tenant.email || '',
        password: '', // Don't populate password for security
        mobile: tenant.mobile || '',
        dob: tenant.dob ? new Date(tenant.dob).toISOString().split('T')[0] : '',
        gender: tenant.gender || '',
        ocupation: tenant.ocupation || '',
        bio: tenant.bio || '',
        roomNum: tenant.roomNum || '',
        rent: tenant.rent || '',
        balance: tenant.balance || '0',
        memberCount: tenant.memberCount || '1',
      })
    }
  }, [isEditMode, tenant])

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

  // If in edit mode but tenant not found
  if (isEditMode && !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Tenant Not Found</h1>
          <p className="text-gray-600">The tenant you are trying to edit could not be found.</p>
          <Button onClick={() => navigate(ROUTES.TENANTS)} className="mt-4">
            Back to Tenants
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

    // Required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    
    // Password is only required for new tenants, not for edits
    if (!isEditMode && !formData.password.trim()) {
      newErrors.password = 'Password is required'
    }
    
    if (!formData.roomNum.trim()) newErrors.roomNum = 'Room number is required'
    if (!formData.rent.trim()) newErrors.rent = 'Rent amount is required'
    if (!formData.memberCount.trim()) newErrors.memberCount = 'Member count is required'

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password validation (only if password is provided)
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long'
    }

    // Numeric validation
    if (formData.rent && isNaN(formData.rent)) {
      newErrors.rent = 'Rent must be a valid number'
    }
    
    if (formData.memberCount && isNaN(formData.memberCount)) {
      newErrors.memberCount = 'Member count must be a valid number'
    }

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
      
      if (isEditMode) {
        // Update existing tenant
        console.log('Updating tenant:', formData)
        // Don't send password if it's empty (user didn't want to change it)
        const updateData = { ...formData }
        if (!updateData.password.trim()) {
          delete updateData.password
        }
        
        const updatedTenant = await tenantService.updateTenant(id, updateData)
        console.log('Tenant updated successfully:', updatedTenant)
        
        dispatch(updateTenant({ id, data: updatedTenant.responseData || updateData }))
        toast.success('Tenant updated successfully!')
      } else {
        // Add new tenant
        console.log('Adding tenant:', formData)
        const newTenant = await tenantService.addTenant(formData)
        console.log('Tenant added successfully:', newTenant)
        
        dispatch(addTenant(newTenant.responseData))
        toast.success('Tenant added successfully!')
      }
      
      // Navigate back to tenants page
      navigate(ROUTES.TENANTS)
      
    } catch (error) {
      console.error(isEditMode ? 'Update tenant error:' : 'Add tenant error:', error)
      const errorMessage = error.response?.data?.message || error.message || `Failed to ${isEditMode ? 'update' : 'add'} tenant`
      dispatch(setError(errorMessage))
      toast.error(errorMessage)
    } finally {
      setLocalLoading(false)
      dispatch(setLoading(false))
    }
  }

  const handleCancel = () => {
    navigate(ROUTES.TENANTS)
  }

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
              ← Back to Tenants
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">
            {isEditMode ? 'Edit Tenant' : 'Add New Tenant'}
          </h1>
          <p className="mt-2 text-gray-600">
            Register a new tenant to your property management system
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.firstName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter last name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter email address"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password {!isEditMode && '*'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={
                      isEditMode 
                        ? "Leave empty to keep current password" 
                        : "Enter password for tenant login"
                    }
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter mobile number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Occupation
                  </label>
                  <input
                    type="text"
                    name="ocupation"
                    value={formData.ocupation}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter occupation"
                  />
                </div>
              </div>
            </div>

            {/* Property Information Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Property Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    name="roomNum"
                    value={formData.roomNum}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.roomNum ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter room number"
                  />
                  {errors.roomNum && <p className="text-red-500 text-sm mt-1">{errors.roomNum}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Rent (₹) *
                  </label>
                  <input
                    type="number"
                    name="rent"
                    value={formData.rent}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.rent ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter monthly rent amount"
                  />
                  {errors.rent && <p className="text-red-500 text-sm mt-1">{errors.rent}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Balance (₹)
                  </label>
                  <input
                    type="number"
                    name="balance"
                    value={formData.balance}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter initial balance (default: 0)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Member Count *
                  </label>
                  <input
                    type="number"
                    name="memberCount"
                    value={formData.memberCount}
                    onChange={handleChange}
                    min="1"
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.memberCount ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Number of family members"
                  />
                  {errors.memberCount && <p className="text-red-500 text-sm mt-1">{errors.memberCount}</p>}
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio / Notes
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional information about the tenant (optional)"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="border-t border-gray-200 pt-6 flex justify-end space-x-3">
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
                className="min-w-[120px]"
              >
                {loading ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">{isEditMode ? 'Updating...' : 'Adding...'}</span>
                  </div>
                ) : (
                  isEditMode ? 'Update Tenant' : 'Add Tenant'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddTenantPage