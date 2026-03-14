import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectUserType } from "../../store/slices/authSlice";
import {
  selectTenants,
  selectTenantLoading,
  selectTenantError,
  setLoading,
  setTenants,
  setError,
  removeTenant,
} from "../../store/slices/tenantSlice";
import { tenantService } from "../../services/tenantService";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { USER_TYPES, ROUTES } from "../../config/constants";
import toast from "react-hot-toast";

const TenantsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userType = useSelector(selectUserType);
  const tenants = useSelector(selectTenants);
  const loading = useSelector(selectTenantLoading);
  const error = useSelector(selectTenantError);
  const isOwner = userType === USER_TYPES.OWNER;

  // State for delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    tenantId: null,
    tenantName: "",
    isDeleting: false,
  });

  useEffect(() => {
    if (isOwner) {
      if (tenants && tenants.length > 0) {
        return;
      }
      loadTenants();
    }
  }, [isOwner]); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect if not owner
  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            This page is only available to property owners.
          </p>
        </div>
      </div>
    );
  }

  const loadTenants = async () => {
    try {
      dispatch(setLoading(true));
      console.log("Fetching tenants...");
      const data = await tenantService.getTenants();
      console.log("Tenants data:", data);
      dispatch(setTenants(data || []));
      toast.success(`Loaded ${(data || []).length || 0} tenants`);
    } catch (error) {
      console.error("Load tenants error:", error);
      dispatch(setError(error.message || "Failed to load tenants"));
      toast.error(
        "Failed to load tenants: " + (error.message || "Unknown error"),
      );
    }
  };

  const handleEditTenant = (tenantId) => {
    navigate(ROUTES.EDITTENANT(tenantId));
  };

  const handleDeleteTenant = (tenant) => {
    // Open confirmation dialog
    setDeleteDialog({
      isOpen: true,
      tenantId: tenant._id,
      tenantName: `${tenant.user.firstName} ${tenant.user.lastName}`,
      isDeleting: false,
    });
  };

  const confirmDelete = async () => {
    try {
      setDeleteDialog((prev) => ({ ...prev, isDeleting: true }));
      console.log("Deleting tenant:", deleteDialog.tenantId);

      await tenantService.deleteTenant(deleteDialog.tenantId);
      toast.success(`${deleteDialog.tenantName} has been deleted`);
      dispatch(removeTenant(deleteDialog.tenantId));

      // Close dialog
      setDeleteDialog({
        isOpen: false,
        tenantId: null,
        tenantName: "",
        isDeleting: false,
      });
    } catch (error) {
      console.error("Delete tenant error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete tenant";
      toast.error(errorMessage);
      setDeleteDialog((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const cancelDelete = () => {
    setDeleteDialog({
      isOpen: false,
      tenantId: null,
      tenantName: "",
      isDeleting: false,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 py-8">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tenant Management
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your tenants and their information
            </p>
          </div>
          <Button onClick={loadTenants} variant="outline">
            🔄 Refresh
          </Button>
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

        {/* Tenants Display */}
        {tenants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map((tenant) => (
              <TenantCard
                key={tenant._id}
                tenant={tenant}
                onEdit={handleEditTenant}
                onDelete={handleDeleteTenant}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-6">�</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No Tenants Found
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {loading
                ? "Loading tenants..."
                : "No tenants have been added yet."}
            </p>
            <Button onClick={loadTenants}>Try Again</Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Tenant"
        message={`Are you sure you want to delete ${deleteDialog.tenantName}?`}
        confirmText="Delete Tenant"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={deleteDialog.isDeleting}
      />
    </div>
  );
};

// Tenant Card Component
const TenantCard = ({ tenant, onEdit, onDelete }) => (
  <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
          {tenant.user.firstName?.charAt(0)?.toUpperCase() || "T"}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">
            {tenant.user?.firstName} {tenant.user?.lastName}
          </h3>
          <p className="text-sm text-gray-600">{tenant.user?.email}</p>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(tenant._id)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Edit tenant"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
        <button
          onClick={() => onDelete(tenant)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete tenant"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>

    <div className="space-y-2 text-sm">
      {tenant.user?.phone && (
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">📞</span>
          <span>{tenant.user?.phone}</span>
        </div>
      )}
      {tenant.unit && (
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">🏠</span>
          <span>Room: {tenant.unit}</span>
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
      {tenant.balance && parseFloat(tenant.balance) !== 0 && (
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">💳</span>
          <span
            className={`font-medium ${parseFloat(tenant.balance) < 0 ? "text-red-600" : "text-green-600"}`}
          >
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
    {tenant.user?.bio && (
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-600 line-clamp-2">{tenant.user?.bio}</p>
      </div>
    )}
  </div>
);

export default TenantsPage;
