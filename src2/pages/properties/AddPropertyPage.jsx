import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { selectUserType } from '../../store/slices/authSlice'
import { selectProperties, addProperty, updateProperty, setLoading, setError } from '../../store/slices/propertySlice'
import { propertyService } from '../../services/propertyService'
import { Button } from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { USER_TYPES, ROUTES } from '../../config/constants'
import toast from 'react-hot-toast'

const AddPropertyPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id } = useParams()
  const userType = useSelector(selectUserType)
  const properties = useSelector(selectProperties)
  const isOwner = userType === USER_TYPES.OWNER
  const isEditMode = !!id
  const property = isEditMode ? properties.find(p => p._id === id) : null

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    },
    propertyType: '',
    totalUnits: '',
    availableUnits: '',
    amenities: '',
    isActive: true
  })

  const [loading, setLocalLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isEditMode && property) {
      setFormData({
        name: property.name || '',
        description: property.description || '',
        address: {
          street: property.address?.street || '',
          city: property.address?.city || '',
          state: property.address?.state || '',
          zipCode: property.address?.zipCode || '',
          country: property.address?.country || 'India'
        },
        propertyType: property.propertyType || '',
        totalUnits: property.totalUnits || '',
        availableUnits: property.availableUnits || '',
        amenities: property.amenities?.join(', ') || '',
        isActive: property.isActive !== undefined ? property.isActive : true
      })
    }
  }, [isEditMode, property])

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

  if (isEditMode && !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <p className="text-gray-600">The property you are trying to edit could not be found.</p>
          <Button onClick={() => navigate(ROUTES.PROPERTIES)} className="mt-4">
            Back to Properties
          </Button>
        </div>
      </div>
    )
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.startsWith('address.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }))
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
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

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Property name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Property name must be at least 2 characters'
    }

    if (!formData.address.street.trim()) {
      newErrors['address.street'] = 'Street address is required'
    }

    if (!formData.address.city.trim()) {
      newErrors['address.city'] = 'City is required'
    }

    if (!formData.address.state.trim()) {
      newErrors['address.state'] = 'State is required'
    }

    if (!formData.address.zipCode.trim()) {
      newErrors['address.zipCode'] = 'Zip code is required'
    }

    if (!formData.address.country.trim()) {
      newErrors['address.country'] = 'Country is required'
    }

    if (!formData.propertyType) {
      newErrors.propertyType = 'Property type is required'
    }

    if (!formData.totalUnits) {
      newErrors.totalUnits = 'Total units is required'
    } else if (isNaN(formData.totalUnits) || parseInt(formData.totalUnits) < 1) {
      newErrors.totalUnits = 'Total units must be at least 1'
    }

    if (formData.availableUnits === '') {
      // Available units is optional, defaults to totalUnits
    } else if (isNaN(formData.availableUnits) || parseInt(formData.availableUnits) < 0) {
      newErrors.availableUnits = 'Available units cannot be negative'
    } else if (parseInt(formData.availableUnits) > parseInt(formData.totalUnits)) {
      newErrors.availableUnits = 'Available units cannot exceed total units'
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
      
      const amenitiesArray = formData.amenities
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0)

      const payload = {
        name: formData.name,
        description: formData.description,
        address: {
          street: formData.address.street,
          city: formData.address.city,
          state: formData.address.state,
          zipCode: formData.address.zipCode,
          country: formData.address.country
        },
        propertyType: formData.propertyType,
        totalUnits: parseInt(formData.totalUnits),
        availableUnits: formData.availableUnits === '' 
          ? parseInt(formData.totalUnits) 
          : parseInt(formData.availableUnits),
        amenities: amenitiesArray,
        isActive: formData.isActive
      }

      if (isEditMode) {
        const response = await propertyService.updateProperty(id, payload)
        const updatedProperty = response.data?.property || response.data
        dispatch(updateProperty(updatedProperty))
        toast.success('Property updated successfully!')
      } else {
        const response = await propertyService.createProperty(payload)
        const newProperty = response.data?.property || response.data
        dispatch(addProperty(newProperty))
        toast.success('Property added successfully!')
      }
      
      navigate(ROUTES.PROPERTIES)
      
    } catch (error) {
      console.error(`${isEditMode ? 'Update' : 'Add'} property error:`, error)
      const errorMessage = error.response?.data?.message || error.message || `Failed to ${isEditMode ? 'update' : 'add'} property`
      dispatch(setError(errorMessage))
      toast.error(errorMessage)
    } finally {
      setLocalLoading(false)
      dispatch(setLoading(false))
    }
  }

  const handleCancel = () => {
    navigate(ROUTES.PROPERTIES)
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 py-8">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button 
            onClick={handleCancel}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center mb-4"
          >
            ← Back to Properties
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Property' : 'Add New Property'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEditMode 
              ? 'Update your property details'
              : 'Add a new property to your portfolio'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {/* Section 1: Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Property Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Sunset Apartments, Green Valley Homes"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Describe your property, its features, and what makes it special..."
                    maxLength={1000}
                  />
                  <p className="mt-1 text-xs text-gray-500">{formData.description.length}/1000 characters</p>
                </div>

                <div>
                  <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="propertyType"
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors.propertyType ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">-- Select type --</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="condo">Condo</option>
                    <option value="studio">Studio</option>
                    <option value="room">Room</option>
                    <option value="commercial">Commercial</option>
                  </select>
                  {errors.propertyType && <p className="mt-1 text-sm text-red-600">{errors.propertyType}</p>}
                </div>

                <div>
                  <label htmlFor="isActive" className="flex items-center space-x-2 cursor-pointer">
                    <input
                      id="isActive"
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Property is Active</span>
                  </label>
                  <p className="mt-1 text-xs text-gray-500 ml-6">Inactive properties won't be visible to tenants</p>
                </div>
              </div>
            </div>

            {/* Section 2: Address */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Property Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="address.street"
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors['address.street'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="123 Main Street"
                  />
                  {errors['address.street'] && <p className="mt-1 text-sm text-red-600">{errors['address.street']}</p>}
                </div>

                <div>
                  <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="address.city"
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors['address.city'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Mumbai"
                  />
                  {errors['address.city'] && <p className="mt-1 text-sm text-red-600">{errors['address.city']}</p>}
                </div>

                <div>
                  <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="address.state"
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors['address.state'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Maharashtra"
                  />
                  {errors['address.state'] && <p className="mt-1 text-sm text-red-600">{errors['address.state']}</p>}
                </div>

                <div>
                  <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Zip Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="address.zipCode"
                    type="text"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors['address.zipCode'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="400001"
                  />
                  {errors['address.zipCode'] && <p className="mt-1 text-sm text-red-600">{errors['address.zipCode']}</p>}
                </div>

                <div>
                  <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="address.country"
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors['address.country'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="India"
                  />
                  {errors['address.country'] && <p className="mt-1 text-sm text-red-600">{errors['address.country']}</p>}
                </div>
              </div>
            </div>

            {/* Section 3: Units */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Unit Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="totalUnits" className="block text-sm font-medium text-gray-700 mb-2">
                    Total Units <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="totalUnits"
                    type="number"
                    name="totalUnits"
                    value={formData.totalUnits}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors.totalUnits ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="10"
                    min="1"
                  />
                  {errors.totalUnits && <p className="mt-1 text-sm text-red-600">{errors.totalUnits}</p>}
                  <p className="mt-1 text-xs text-gray-500">Total number of rentable units</p>
                </div>

                <div>
                  <label htmlFor="availableUnits" className="block text-sm font-medium text-gray-700 mb-2">
                    Available Units
                  </label>
                  <input
                    id="availableUnits"
                    type="number"
                    name="availableUnits"
                    value={formData.availableUnits}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors.availableUnits ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="10"
                    min="0"
                  />
                  {errors.availableUnits && <p className="mt-1 text-sm text-red-600">{errors.availableUnits}</p>}
                  <p className="mt-1 text-xs text-gray-500">Leave empty to default to total units</p>
                </div>
              </div>
            </div>

            {/* Section 4: Amenities */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Amenities</h2>
              <div>
                <label htmlFor="amenities" className="block text-sm font-medium text-gray-700 mb-2">
                  Property Amenities
                </label>
                <textarea
                  id="amenities"
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="e.g., Parking, Gym, Pool, Garden, Security, Elevator (separate with commas)"
                />
                <p className="mt-1 text-xs text-gray-500">Enter amenities separated by commas</p>
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
                {isEditMode ? 'Update Property' : 'Add Property'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddPropertyPage
