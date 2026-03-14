import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { selectUserType } from '../../store/slices/authSlice'
import { 
  selectProperties, 
  selectPropertyLoading, 
  selectPropertyError,
  setLoading,
  setProperties,
  setError,
  deleteProperty
} from '../../store/slices/propertySlice'
import { propertyService } from '../../services/propertyService'
import { Button } from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { USER_TYPES, ROUTES } from '../../config/constants'
import toast from 'react-hot-toast'

const PropertiesPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const userType = useSelector(selectUserType)
  const properties = useSelector(selectProperties)
  const loading = useSelector(selectPropertyLoading)
  const error = useSelector(selectPropertyError)
  const isOwner = userType === USER_TYPES.OWNER

  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    propertyId: null,
    propertyName: '',
    isDeleting: false
  })

  useEffect(() => {
    if (isOwner) {
      if (properties && properties.length > 0) {
        return
      }
      loadProperties()
    }
  }, [isOwner]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const loadProperties = async () => {
    try {
      dispatch(setLoading(true))
      const response = await propertyService.getProperties()
      const propertiesData = response.data?.properties || response.properties || response.data || []
      dispatch(setProperties({ 
        properties: propertiesData,
        pagination: response.data?.pagination || response.pagination || null
      }))
      toast.success(`Loaded ${propertiesData.length} properties`)
    } catch (error) {
      console.error('Load properties error:', error)
      const errorMessage = error.response?.data?.message || 'Failed to load properties'
      dispatch(setError(errorMessage))
      toast.error(errorMessage)
    }
  }

  const handleAddProperty = () => {
    navigate(ROUTES.ADD_PROPERTY)
  }

  const handleEditProperty = (propertyId) => {
    navigate(ROUTES.EDIT_PROPERTY(propertyId))
  }

  const handleDeleteProperty = (property) => {
    setDeleteDialog({
      isOpen: true,
      propertyId: property._id,
      propertyName: property.name,
      isDeleting: false
    })
  }

  const confirmDelete = async () => {
    try {
      setDeleteDialog(prev => ({ ...prev, isDeleting: true }))
      
      await propertyService.deleteProperty(deleteDialog.propertyId)
      dispatch(deleteProperty(deleteDialog.propertyId))
      
      toast.success(`${deleteDialog.propertyName} has been deleted`)
      
      setDeleteDialog({
        isOpen: false,
        propertyId: null,
        propertyName: '',
        isDeleting: false
      })
    } catch (error) {
      console.error('Delete property error:', error)
      const errorMessage = error.response?.data?.message || 'Failed to delete property'
      toast.error(errorMessage)
      setDeleteDialog(prev => ({ ...prev, isDeleting: false }))
    }
  }

  const cancelDelete = () => {
    setDeleteDialog({
      isOpen: false,
      propertyId: null,
      propertyName: '',
      isDeleting: false
    })
  }

  const getPropertyTypeLabel = (type) => {
    const types = {
      apartment: 'Apartment',
      house: 'House',
      condo: 'Condo',
      studio: 'Studio',
      room: 'Room',
      commercial: 'Commercial'
    }
    return types[type] || type
  }

  const getPropertyTypeBadgeColor = (type) => {
    const colors = {
      apartment: 'bg-blue-100 text-blue-800',
      house: 'bg-green-100 text-green-800',
      condo: 'bg-purple-100 text-purple-800',
      studio: 'bg-yellow-100 text-yellow-800',
      room: 'bg-pink-100 text-pink-800',
      commercial: 'bg-gray-100 text-gray-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const calculateOccupancyRate = (totalUnits, availableUnits) => {
    if (totalUnits === 0) return 0
    return (((totalUnits - availableUnits) / totalUnits) * 100).toFixed(0)
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 py-8">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
            <p className="mt-2 text-gray-600">
              Manage your rental properties and track occupancy
            </p>
          </div>
          <Button onClick={handleAddProperty} className="flex items-center gap-2">
            <span className="text-lg">+</span> Add Property
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
            <button 
              onClick={loadProperties}
              className="mt-2 text-red-600 hover:text-red-700 font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && properties.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Properties Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by adding your first property to manage tenants and track rent
              </p>
              <Button onClick={handleAddProperty} className="inline-flex items-center gap-2">
                <span className="text-lg">+</span> Add Your First Property
              </Button>
            </div>
          </div>
        )}

        {/* Properties Grid */}
        {!loading && properties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => {
              const occupancyRate = calculateOccupancyRate(property.totalUnits, property.availableUnits)
              const occupiedUnits = property.totalUnits - property.availableUnits

              return (
                <div 
                  key={property._id} 
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Property Image */}
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-6xl">
                      {property.propertyType === 'apartment' && '🏢'}
                      {property.propertyType === 'house' && '🏠'}
                      {property.propertyType === 'condo' && '🏘️'}
                      {property.propertyType === 'studio' && '🏙️'}
                      {property.propertyType === 'room' && '🚪'}
                      {property.propertyType === 'commercial' && '🏬'}
                    </span>
                  </div>

                  {/* Property Info */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold text-gray-900 flex-1">
                        {property.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPropertyTypeBadgeColor(property.propertyType)}`}>
                        {getPropertyTypeLabel(property.propertyType)}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 mb-4">
                      <p className="flex items-center gap-2">
                        <span>📍</span>
                        <span>{property.address?.city}, {property.address?.state}</span>
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {property.address?.street}
                      </p>
                    </div>

                    {/* Units Info */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Occupancy</span>
                        <span className="text-sm font-semibold text-gray-900">{occupancyRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${occupancyRate}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{occupiedUnits} occupied</span>
                        <span>{property.availableUnits} available</span>
                        <span>{property.totalUnits} total</span>
                      </div>
                    </div>

                    {/* Amenities */}
                    {property.amenities && property.amenities.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {property.amenities.slice(0, 3).map((amenity, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                            >
                              {amenity}
                            </span>
                          ))}
                          {property.amenities.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              +{property.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleEditProperty(property._id)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProperty(property)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          title="Delete Property"
          message={`Are you sure you want to delete "${deleteDialog.propertyName}"? This action cannot be undone.`}
          confirmLabel={deleteDialog.isDeleting ? 'Deleting...' : 'Delete'}
          cancelLabel="Cancel"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          isLoading={deleteDialog.isDeleting}
          variant="danger"
        />
      </div>
    </div>
  )
}

export default PropertiesPage
