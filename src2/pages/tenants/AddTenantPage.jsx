import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { selectUserType } from '../../store/slices/authSlice'
import { selectProperties, selectPropertyLoading, setProperties, setLoading as setPropertyLoading, setError as setPropertyError } from '../../store/slices/propertySlice'
import { addTenant, updateTenant, setLoading, setError, selectTenants } from '../../store/slices/tenantSlice'
import { tenantService } from '../../services/tenantService'
import { propertyService } from '../../services/propertyService'
import { Button } from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { USER_TYPES, ROUTES, FORM_VALIDATION } from '../../config/constants'
import toast from 'react-hot-toast'

const AddTenantPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id } = useParams()
  const userType = useSelector(selectUserType)
  const properties = useSelector(selectProperties)
  const propertiesLoading = useSelector(selectPropertyLoading)
  const tenants = useSelector(selectTenants)
  const isOwner = userType === USER_TYPES.OWNER
  const isEditMode = !!id
  const tenant = isEditMode ? tenants.find(t => t._id === id) : null

  // Form state - properly structured for backend Tenant model
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    bio: '',
    property: '',
    unit: '',
    leaseDetails: {
      startDate: '',
      endDate: '',
      monthlyRent: '',
      securityDeposit: '0',
      leaseType: 'fixed'
    },
    occupants: [],
    emergencyContacts: [],
    preferences: {
      notifications: {
        email: true,
        sms: false,
        push: true
      },
      paymentMethod: 'online'
    },
    status: 'active'
  })

  const [loading, setLocalLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Fetch owner's properties on component mount
  useEffect(() => {
    const fetchProperties = async () => {
      if (!isOwner) return
      
      try {
        dispatch(setPropertyLoading(true))
        const response = await propertyService.getProperties()
        const propertiesData = response.data?.properties || response.properties || response.data || []
        
        dispatch(setProperties({ 
          properties: propertiesData,
          pagination: response.data?.pagination || response.pagination || null
        }))
        
        console.log('Fetched properties:', propertiesData)
      } catch (error) {
        console.error('Failed to fetch properties:', error)
        const errorMessage = error.response?.data?.message || 'Failed to load properties'
        dispatch(setPropertyError(errorMessage))
        toast.error(errorMessage)
      } finally {
        dispatch(setPropertyLoading(false))
      }
    }

    fetchProperties()
  }, [dispatch, isOwner])

  // Initialize form data for edit mode
  useEffect(() => {
    if (isEditMode && tenant) {
      setFormData({
        firstName: tenant.user?.firstName || '',
        lastName: tenant.user?.lastName || '',
        email: tenant.user?.email || '',
        password: '',
        phone: tenant.user?.phone || '',
        dateOfBirth: tenant.user?.dateOfBirth ? new Date(tenant.user.dateOfBirth).toISOString().split('T')[0] : '',
        gender: tenant.user?.gender || '',
        bio: tenant.user?.bio || '',
        property: tenant.property?._id || '',
        unit: tenant.unit || '',
        leaseDetails: {
          startDate: tenant.leaseDetails?.startDate ? new Date(tenant.leaseDetails.startDate).toISOString().split('T')[0] : '',
          endDate: tenant.leaseDetails?.endDate ? new Date(tenant.leaseDetails.endDate).toISOString().split('T')[0] : '',
          monthlyRent: tenant.leaseDetails?.monthlyRent || '',
          securityDeposit: tenant.leaseDetails?.securityDeposit || '0',
          leaseType: tenant.leaseDetails?.leaseType || 'fixed'
        },
        occupants: tenant.occupants || [],
        emergencyContacts: tenant.emergencyContacts || [],
        preferences: {
          notifications: {
            email: tenant.preferences?.notifications?.email ?? true,
            sms: tenant.preferences?.notifications?.sms ?? false,
            push: tenant.preferences?.notifications?.push ?? true
          },
          paymentMethod: tenant.preferences?.paymentMethod || 'online'
        },
        status: tenant.status || 'active'
      })
    }
  }, [isEditMode, tenant])

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
    const { name, value, type, checked } = e.target
    
    if (name.startsWith('leaseDetails.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        leaseDetails: { ...prev.leaseDetails, [field]: value }
      }))
    } else if (name.startsWith('preferences.notifications.')) {
      const field = name.split('.')[2]
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          notifications: {
            ...prev.preferences.notifications,
            [field]: checked
          }
        }
      }))
    } else if (name.startsWith('preferences.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        preferences: { ...prev.preferences, [field]: value }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Handle adding occupant
  const handleAddOccupant = () => {
    setFormData(prev => ({
      ...prev,
      occupants: [
        ...prev.occupants,
        { name: '', relationship: 'other', dateOfBirth: '', phone: '' }
      ]
    }))
  }

  // Handle removing occupant
  const handleRemoveOccupant = (index) => {
    setFormData(prev => ({
      ...prev,
      occupants: prev.occupants.filter((_, i) => i !== index)
    }))
  }

  // Handle occupant field change
  const handleOccupantChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      occupants: prev.occupants.map((occupant, i) =>
        i === index ? { ...occupant, [field]: value } : occupant
      )
    }))
  }

  // Handle adding emergency contact
  const handleAddEmergencyContact = () => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: [
        ...prev.emergencyContacts,
        { name: '', relationship: '', phone: '', email: '', isPrimary: false }
      ]
    }))
  }

  // Handle removing emergency contact
  const handleRemoveEmergencyContact = (index) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index)
    }))
  }

  // Handle emergency contact field change
  const handleEmergencyContactChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.map((contact, i) =>
        i === index ? { ...contact, [field]: value } : contact
      )
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!FORM_VALIDATION.EMAIL_REGEX.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!isEditMode) {
      if (!formData.password.trim()) {
        newErrors.password = 'Password is required'
      } else if (formData.password.length < FORM_VALIDATION.PASSWORD_MIN_LENGTH) {
        newErrors.password = `Password must be at least ${FORM_VALIDATION.PASSWORD_MIN_LENGTH} characters`
      }
    } else if (formData.password && formData.password.length < FORM_VALIDATION.PASSWORD_MIN_LENGTH) {
      newErrors.password = `Password must be at least ${FORM_VALIDATION.PASSWORD_MIN_LENGTH} characters`
    }

    if (formData.phone && !FORM_VALIDATION.PHONE_REGEX.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    if (!formData.property) {
      newErrors.property = 'Please select a property'
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit/Room number is required'
    }

    if (!formData.leaseDetails.startDate) {
      newErrors['leaseDetails.startDate'] = 'Lease start date is required'
    }

    if (!formData.leaseDetails.endDate) {
      newErrors['leaseDetails.endDate'] = 'Lease end date is required'
    }

    if (formData.leaseDetails.startDate && formData.leaseDetails.endDate) {
      const startDate = new Date(formData.leaseDetails.startDate)
      const endDate = new Date(formData.leaseDetails.endDate)
      if (endDate <= startDate) {
        newErrors['leaseDetails.endDate'] = 'End date must be after start date'
      }
    }

    if (!formData.leaseDetails.monthlyRent) {
      newErrors['leaseDetails.monthlyRent'] = 'Monthly rent is required'
    } else if (isNaN(formData.leaseDetails.monthlyRent) || parseFloat(formData.leaseDetails.monthlyRent) <= 0) {
      newErrors['leaseDetails.monthlyRent'] = 'Monthly rent must be a positive number'
    }

    if (formData.leaseDetails.securityDeposit && isNaN(formData.leaseDetails.securityDeposit)) {
      newErrors['leaseDetails.securityDeposit'] = 'Security deposit must be a valid number'
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
        // For edit mode, send tenant-specific fields and user updates separately
        const payload = {
          user: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            bio: formData.bio
          },
          property: formData.property,
          unit: formData.unit,
          leaseDetails: {
            startDate: formData.leaseDetails.startDate,
            endDate: formData.leaseDetails.endDate,
            monthlyRent: parseFloat(formData.leaseDetails.monthlyRent),
            securityDeposit: parseFloat(formData.leaseDetails.securityDeposit || 0),
            leaseType: formData.leaseDetails.leaseType
          },
          occupants: formData.occupants,
          emergencyContacts: formData.emergencyContacts,
          preferences: formData.preferences,
          status: formData.status
        }
        
        // Only include password if it was changed
        if (formData.password && formData.password.trim()) {
          payload.user.password = formData.password
        }
        
        const response = await tenantService.updateTenant(id, payload)
        const updatedTenant = response.data?.tenant || response.data
        dispatch(updateTenant({ id, data: updatedTenant }))
        toast.success('Tenant updated successfully!')
      } else {
        // For add mode, include all user fields including email and password
        const payload = {
          user: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            bio: formData.bio
          },
          property: formData.property,
          unit: formData.unit,
          leaseDetails: {
            startDate: formData.leaseDetails.startDate,
            endDate: formData.leaseDetails.endDate,
            monthlyRent: parseFloat(formData.leaseDetails.monthlyRent),
            securityDeposit: parseFloat(formData.leaseDetails.securityDeposit || 0),
            leaseType: formData.leaseDetails.leaseType
          },
          occupants: formData.occupants,
          emergencyContacts: formData.emergencyContacts,
          preferences: formData.preferences,
          status: formData.status
        }
        
        const response = await tenantService.addTenant(payload)
        const newTenant = response.data?.tenant || response.data
        dispatch(addTenant(newTenant))
        toast.success('Tenant added successfully!')
      }
      
      navigate(ROUTES.TENANTS)
      
    } catch (error) {
      console.error(`${isEditMode ? 'Update' : 'Add'} tenant error:`, error)
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button 
            onClick={handleCancel}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center mb-4"
          >
            ← Back to Tenants
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Tenant Information' : 'Add New Tenant'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEditMode 
              ? 'Update tenant details and lease information'
              : 'Register a new tenant to your property management system'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {/* Section 1: Personal Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="John"
                  />
                  {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isEditMode}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    } ${isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  {isEditMode && <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password {!isEditMode && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder={isEditMode ? 'Leave empty to keep current password' : 'Minimum 8 characters'}
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="+91 XXXXX XXXXX"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    id="dateOfBirth"
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    Bio / Additional Notes
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Any additional information about the tenant..."
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Property & Unit */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Property & Unit Assignment</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="property" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Property <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="property"
                    name="property"
                    value={formData.property}
                    onChange={handleChange}
                    disabled={propertiesLoading}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors.property ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    } ${propertiesLoading ? 'bg-gray-100 cursor-wait' : ''}`}
                  >
                    <option value="">
                      {propertiesLoading ? 'Loading properties...' : '-- Select a property --'}
                    </option>
                    {properties?.map(prop => (
                      <option key={prop._id} value={prop._id}>
                        {prop.name} ({prop.address?.city})
                      </option>
                    ))}
                  </select>
                  {errors.property && <p className="mt-1 text-sm text-red-600">{errors.property}</p>}
                  {!propertiesLoading && properties?.length === 0 && (
                    <div className="mt-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="font-medium mb-2">⚠️ No properties found</p>
                      <p className="mb-2">You need to add a property first before registering tenants.</p>
                      <button 
                        type="button"
                        onClick={() => navigate(ROUTES.ADD_PROPERTY)}
                        className="text-blue-600 hover:text-blue-700 font-medium underline"
                      >
                        Add your first property →
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
                    Unit / Room Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="unit"
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors.unit ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 101, A-2, Unit 5"
                  />
                  {errors.unit && <p className="mt-1 text-sm text-red-600">{errors.unit}</p>}
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Tenant Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Lease Details */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Lease Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="leaseStartDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Lease Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="leaseStartDate"
                    type="date"
                    name="leaseDetails.startDate"
                    value={formData.leaseDetails.startDate}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors['leaseDetails.startDate'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors['leaseDetails.startDate'] && <p className="mt-1 text-sm text-red-600">{errors['leaseDetails.startDate']}</p>}
                </div>

                <div>
                  <label htmlFor="leaseEndDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Lease End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="leaseEndDate"
                    type="date"
                    name="leaseDetails.endDate"
                    value={formData.leaseDetails.endDate}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors['leaseDetails.endDate'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors['leaseDetails.endDate'] && <p className="mt-1 text-sm text-red-600">{errors['leaseDetails.endDate']}</p>}
                </div>

                <div>
                  <label htmlFor="monthlyRent" className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Rent (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="monthlyRent"
                    type="number"
                    name="leaseDetails.monthlyRent"
                    value={formData.leaseDetails.monthlyRent}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors['leaseDetails.monthlyRent'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                  {errors['leaseDetails.monthlyRent'] && <p className="mt-1 text-sm text-red-600">{errors['leaseDetails.monthlyRent']}</p>}
                </div>

                <div>
                  <label htmlFor="securityDeposit" className="block text-sm font-medium text-gray-700 mb-2">
                    Security Deposit (₹)
                  </label>
                  <input
                    id="securityDeposit"
                    type="number"
                    name="leaseDetails.securityDeposit"
                    value={formData.leaseDetails.securityDeposit}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors['leaseDetails.securityDeposit'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                  {errors['leaseDetails.securityDeposit'] && <p className="mt-1 text-sm text-red-600">{errors['leaseDetails.securityDeposit']}</p>}
                </div>

                <div>
                  <label htmlFor="leaseType" className="block text-sm font-medium text-gray-700 mb-2">
                    Lease Type
                  </label>
                  <select
                    id="leaseType"
                    name="leaseDetails.leaseType"
                    value={formData.leaseDetails.leaseType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="fixed">Fixed Term</option>
                    <option value="month-to-month">Month-to-Month</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: Occupants */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Occupants</h2>
                  <p className="text-sm text-gray-600 mt-1">Additional people living in the unit</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddOccupant}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium text-sm flex items-center gap-2"
                >
                  <span className="text-lg">+</span> Add Occupant
                </button>
              </div>

              {formData.occupants.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-gray-600">No occupants added yet. Click "Add Occupant" to add family members or others living in the unit.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.occupants.map((occupant, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium text-gray-900">Occupant {index + 1}</h3>
                        <button
                          type="button"
                          onClick={() => handleRemoveOccupant(index)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name
                          </label>
                          <input
                            type="text"
                            value={occupant.name}
                            onChange={(e) => handleOccupantChange(index, 'name', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="Full name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Relationship
                          </label>
                          <select
                            value={occupant.relationship}
                            onChange={(e) => handleOccupantChange(index, 'relationship', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          >
                            <option value="other">Other</option>
                            <option value="spouse">Spouse</option>
                            <option value="child">Child</option>
                            <option value="parent">Parent</option>
                            <option value="sibling">Sibling</option>
                            <option value="friend">Friend</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            value={occupant.dateOfBirth}
                            onChange={(e) => handleOccupantChange(index, 'dateOfBirth', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={occupant.phone}
                            onChange={(e) => handleOccupantChange(index, 'phone', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="+91 XXXXX XXXXX"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 5: Emergency Contacts */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Emergency Contacts</h2>
                  <p className="text-sm text-gray-600 mt-1">People to contact in case of emergency</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddEmergencyContact}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium text-sm flex items-center gap-2"
                >
                  <span className="text-lg">+</span> Add Contact
                </button>
              </div>

              {formData.emergencyContacts.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-gray-600">No emergency contacts added yet. Click "Add Contact" to provide emergency contact information.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.emergencyContacts.map((contact, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium text-gray-900">Emergency Contact {index + 1}</h3>
                        <button
                          type="button"
                          onClick={() => handleRemoveEmergencyContact(index)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={contact.name}
                            onChange={(e) => handleEmergencyContactChange(index, 'name', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="Full name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Relationship <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={contact.relationship}
                            onChange={(e) => handleEmergencyContactChange(index, 'relationship', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="e.g., Mother, Brother, Friend"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={contact.phone}
                            onChange={(e) => handleEmergencyContactChange(index, 'phone', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="+91 XXXXX XXXXX"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={contact.email}
                            onChange={(e) => handleEmergencyContactChange(index, 'email', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="email@example.com"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={contact.isPrimary}
                              onChange={(e) => handleEmergencyContactChange(index, 'isPrimary', e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Primary Emergency Contact</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 6: Preferences */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Tenant Preferences</h2>
              
              <div className="space-y-6">
                {/* Notification Preferences */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Notification Preferences</h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="preferences.notifications.email"
                        checked={formData.preferences.notifications.email}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Email Notifications</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="preferences.notifications.sms"
                        checked={formData.preferences.notifications.sms}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">SMS Notifications</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="preferences.notifications.push"
                        checked={formData.preferences.notifications.push}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Push Notifications</span>
                    </label>
                  </div>
                </div>

                {/* Payment Method Preference */}
                <div>
                  <label htmlFor="paymentMethod" className="block text-sm font-semibold text-gray-900 mb-3">
                    Preferred Payment Method
                  </label>
                  <select
                    id="paymentMethod"
                    name="preferences.paymentMethod"
                    value={formData.preferences.paymentMethod}
                    onChange={handleChange}
                    className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="online">Online Payment</option>
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="border-t border-gray-200 pt-8 flex justify-end gap-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                {loading && <LoadingSpinner size="sm" />}
                {isEditMode ? 'Update Tenant' : 'Add Tenant'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddTenantPage
