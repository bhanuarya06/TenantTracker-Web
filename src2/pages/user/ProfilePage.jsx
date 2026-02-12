import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useAuth } from '../../hooks/useAuth'
import { selectUser, selectUserType } from '../../store/slices/authSlice'
import { Button } from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { FORM_VALIDATION } from '../../config/constants'

export const ProfilePage = () => {
  const user = useSelector(selectUser)
  const userType = useSelector(selectUserType)
  const { updateProfile, isLoading } = useAuth()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    mobile: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    bio: '',
  })
  const [errors, setErrors] = useState({})
  const [isEditing, setIsEditing] = useState(false)

  // Initialize form data when user data loads
  useEffect(() => {
    if (user) {
      // Handle address field - ensure it's an object with all required fields
      const getAddressObject = (address) => {
        if (!address) {
          return {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          }
        }
        
        if (typeof address === 'object') {
          return {
            street: address.street || '',
            city: address.city || '',
            state: address.state || '',
            zipCode: address.zipCode || '',
            country: address.country || ''
          }
        }
        
        // If it's a string, try to parse it (legacy support)
        if (typeof address === 'string') {
          return {
            street: address,
            city: '',
            state: '',
            zipCode: '',
            country: ''
          }
        }
        
        return {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        }
      }

      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        dob: user.dob ? user.dob.slice(0, 10) : (user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : ''),
        gender: user.gender || '',
        mobile: user.mobile || user.phone || '',
        address: getAddressObject(user.address),
        bio: user.bio || '',
      })
    }
  }, [user])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (formData.mobile && !FORM_VALIDATION.PHONE_REGEX.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const result = await updateProfile(formData)
    
    if (result.success) {
      setIsEditing(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleAddressChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }))
    
    // Clear address errors when user starts typing
    if (errors[`address.${name}`]) {
      setErrors(prev => ({ ...prev, [`address.${name}`]: '' }))
    }
  }

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      // Handle address field - ensure it's an object with all required fields
      const getAddressObject = (address) => {
        if (!address) {
          return {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          }
        }
        
        if (typeof address === 'object') {
          return {
            street: address.street || '',
            city: address.city || '',
            state: address.state || '',
            zipCode: address.zipCode || '',
            country: address.country || ''
          }
        }
        
        // If it's a string, try to parse it (legacy support)
        if (typeof address === 'string') {
          return {
            street: address,
            city: '',
            state: '',
            zipCode: '',
            country: ''
          }
        }
        
        return {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        }
      }

      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        dob: user.dob ? user.dob.slice(0, 10) : (user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : ''),
        gender: user.gender || '',
        mobile: user.mobile || user.phone || '',
        address: getAddressObject(user.address),
        bio: user.bio || '',
      })
    }
    setErrors({})
    setIsEditing(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your account information and preferences
              </p>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>

          {/* Profile Content */}
          <div className="p-6">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        First Name *
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        className={`mt-1 block w-full px-3 py-2 border ${
                          errors.firstName ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        value={formData.firstName}
                        onChange={handleInputChange}
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Last Name *
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        className={`mt-1 block w-full px-3 py-2 border ${
                          errors.lastName ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        value={formData.lastName}
                        onChange={handleInputChange}
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
                        Date of Birth
                      </label>
                      <input
                        id="dob"
                        name="dob"
                        type="date"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.dob}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                        Gender
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.gender}
                        onChange={handleInputChange}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                        Mobile Number
                      </label>
                      <input
                        id="mobile"
                        name="mobile"
                        type="tel"
                        className={`mt-1 block w-full px-3 py-2 border ${
                          errors.mobile ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        value={formData.mobile}
                        onChange={handleInputChange}
                      />
                      {errors.mobile && (
                        <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>
                      )}
                    </div>

                    {/* Address Fields */}
                    <div className="col-span-2">
                      <h4 className="text-md font-medium text-gray-900 mb-3">Address</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                            Street Address
                          </label>
                          <input
                            id="street"
                            name="street"
                            type="text"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={formData.address.street}
                            onChange={handleAddressChange}
                          />
                          {errors['address.street'] && (
                            <p className="mt-1 text-sm text-red-600">{errors['address.street']}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                            City
                          </label>
                          <input
                            id="city"
                            name="city"
                            type="text"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={formData.address.city}
                            onChange={handleAddressChange}
                          />
                          {errors['address.city'] && (
                            <p className="mt-1 text-sm text-red-600">{errors['address.city']}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                            State/Province
                          </label>
                          <input
                            id="state"
                            name="state"
                            type="text"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={formData.address.state}
                            onChange={handleAddressChange}
                          />
                          {errors['address.state'] && (
                            <p className="mt-1 text-sm text-red-600">{errors['address.state']}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                            ZIP/Postal Code
                          </label>
                          <input
                            id="zipCode"
                            name="zipCode"
                            type="text"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={formData.address.zipCode}
                            onChange={handleAddressChange}
                          />
                          {errors['address.zipCode'] && (
                            <p className="mt-1 text-sm text-red-600">{errors['address.zipCode']}</p>
                          )}
                        </div>

                        <div className="col-span-2">
                          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                            Country
                          </label>
                          <input
                            id="country"
                            name="country"
                            type="text"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={formData.address.country}
                            onChange={handleAddressChange}
                          />
                          {errors['address.country'] && (
                            <p className="mt-1 text-sm text-red-600">{errors['address.country']}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    About You
                  </h3>
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tell us a bit about yourself..."
                      value={formData.bio}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-8">
                {/* Profile Display */}
                <div className="flex items-start space-x-6">
                  <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user.firstName?.charAt(0)?.toUpperCase()}{user.lastName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className="text-gray-600">{user.email}</p>
                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {userType === 'owner' ? 'Property Owner' : 'Tenant'}
                    </div>
                  </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoCard
                    title="Date of Birth"
                    value={(user.dob || user.dateOfBirth) ? new Date(user.dob || user.dateOfBirth).toLocaleDateString() : 'Not provided'}
                  />
                  <InfoCard
                    title="Gender"
                    value={user.gender || 'Not specified'}
                  />
                  <InfoCard
                    title="Mobile Number"
                    value={user.mobile || user.phone || 'Not provided'}
                  />
                </div>

                {/* Address Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Address</h3>
                  {user.address && (typeof user.address === 'object') ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoCard
                        title="Street Address"
                        value={user.address.street || 'Not provided'}
                      />
                      <InfoCard
                        title="City"
                        value={user.address.city || 'Not provided'}
                      />
                      <InfoCard
                        title="State/Province"
                        value={user.address.state || 'Not provided'}
                      />
                      <InfoCard
                        title="ZIP/Postal Code"
                        value={user.address.zipCode || 'Not provided'}
                      />
                      <InfoCard
                        title="Country"
                        value={user.address.country || 'Not provided'}
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-500">No address information provided</p>
                    </div>
                  )}
                </div>

                {user.bio && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Bio</h3>
                    <p className="text-gray-700 leading-relaxed">{user.bio}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const InfoCard = ({ title, value }) => {
  // Handle different value types safely
  const renderValue = () => {
    if (value === null || value === undefined) {
      return 'Not provided'
    }
    
    if (typeof value === 'object') {
      // If it's an address object, format it as a string
      if (value.street || value.city || value.state || value.zipCode) {
        const parts = [
          value.street,
          value.city,
          value.state,
          value.zipCode
        ].filter(Boolean)
        return parts.length > 0 ? parts.join(', ') : 'Not provided'
      }
      // If it's some other object, stringify it or return default
      return JSON.stringify(value) || 'Not provided'
    }
    
    // If it's already a string/number, return as is
    return value || 'Not provided'
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <dt className="text-sm font-medium text-gray-500">{title}</dt>
      <dd className="mt-1 text-sm text-gray-900">{renderValue()}</dd>
    </div>
  )
}