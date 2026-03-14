import { useState, useEffect } from "react";
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
} from "../../store/slices/tenantSlice";
import { tenantService } from "../../services/tenantService";
import { billService } from "../../services/billService";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { USER_TYPES, ROUTES } from "../../config/constants";
import toast from "react-hot-toast";

const RentHistoryPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userType = useSelector(selectUserType);
  const tenants = useSelector(selectTenants);
  const loading = useSelector(selectTenantLoading);
  const error = useSelector(selectTenantError);
  const isOwner = userType === USER_TYPES.OWNER;

  const [selectedTenant, setSelectedTenant] = useState(null);
  const [rentHistory, setRentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [billDetail, setBillDetail] = useState(null);
  const [billDetailLoading, setBillDetailLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const [isSendConfirming, setIsSendConfirming] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  // Handler for bill card click
  const handleBillClick = async (bill) => {
    setSelectedBill(bill);
    setBillDetail(null);
    setBillDetailLoading(true);
    try {
      const detail = await billService.getBillById(bill._id);
      // Handle both response formats: { bill: ... } or { data: { bill: ... } }
      const billData = detail?.bill || detail?.data?.bill || detail;
      setBillDetail({ data: { bill: billData } });
    } catch {
      toast.error("Failed to load bill details");
    } finally {
      setBillDetailLoading(false);
    }
  };

  const handleCloseBillDetail = () => {
    setSelectedBill(null);
    setBillDetail(null);
    setIsEditMode(false);
    setEditFormData({});
    setIsDeleteConfirming(false);
    setIsSendConfirming(false);
  };

  const handleEditBill = () => {
    setIsEditMode(true);
    const billCharges = billDetail?.data?.bill?.charges || {};
    setEditFormData({
      charges: {
        rent: billCharges.rent ?? 0,
        utilities: {
          water: billCharges.utilities?.water ?? 0,
          electricity: billCharges.utilities?.electricity ?? 0,
          trash: billCharges.utilities?.trash ?? 0,
        },
        maintenance: billCharges.maintenance ?? 0,
      },
      dueDate: billDetail?.data?.bill?.dueDate || '',
    });
  };

  const handleSaveBillEdit = async () => {
    try {
      setActionLoading(true);
      const updatedBill = await billService.updateBill(selectedBill._id, editFormData);
      // Handle both response formats
      const billData = updatedBill?.bill || updatedBill?.data?.bill || updatedBill;
      setBillDetail({ data: { bill: billData } });
      setIsEditMode(false);
      toast.success('Bill updated successfully');
    } catch (error) {
      console.error('Update bill error:', error);
      toast.error('Failed to update bill: ' + (error.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBill = async () => {
    try {
      setActionLoading(true);
      await billService.deleteBill(selectedBill._id);
      toast.success('Bill deleted successfully');
      setIsDeleteConfirming(false);
      handleCloseBillDetail();
      // Reload rent history
      loadRentHistory(selectedTenant._id);
    } catch (error) {
      console.error('Delete bill error:', error);
      toast.error('Failed to delete bill: ' + (error.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendBill = async () => {
    try {
      setActionLoading(true);
      const result = await billService.sendBill(selectedBill._id);
      // Handle both response formats
      const billData = result?.bill || result?.data?.bill || result;
      setBillDetail({ data: { bill: billData } });
      setIsSendConfirming(false);
      toast.success('Bill sent to tenant successfully');
    } catch (error) {
      console.error('Send bill error:', error);
      toast.error('Failed to send bill: ' + (error.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (isOwner && (!tenants || tenants.length === 0)) {
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
      toast.success(`Loaded ${data?.length || 0} tenants`);
    } catch (error) {
      console.error("Load tenants error:", error);
      dispatch(setError(error.message || "Failed to load tenants"));
      toast.error(
        "Failed to load tenants: " + (error.message || "Unknown error"),
      );
    }
  };

  const loadRentHistory = async (tenantId) => {
    try {
      setHistoryLoading(true);
      console.log("Fetching rent history for tenant:", tenantId);
      const history = await billService.getBillsByTenantId(tenantId);
      console.log("Rent history:", history);
      setRentHistory(history || []);
      toast.success("Rent history loaded successfully");
    } catch (error) {
      console.error("Load rent history error:", error);
      toast.error(
        "Failed to load rent history: " + (error.message || "Unknown error"),
      );
      setRentHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleTenantSelect = (tenant) => {
    setSelectedTenant(tenant);
    console.log(tenant);
    loadRentHistory(tenant._id);
  };

  const handleBackToTenants = () => {
    setSelectedTenant(null);
    setRentHistory([]);
  };

  const handleAddBill = (tenant) => {
    navigate(ROUTES.ADD_BILL(tenant._id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 py-8">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with gradient background */}
        <div className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
              {selectedTenant
                ? `${selectedTenant.user?.firstName || 'Tenant'}'s Rent History`
                : "Tenant Rent History"}
            </h1>
            <p className="text-lg text-gray-600 font-light">
              {selectedTenant
                ? `View detailed billing and payment history for ${selectedTenant.user?.firstName || 'Tenant'} ${selectedTenant.user?.lastName || ''}`
                : "Select a tenant to view their rental payment history"}
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  No Tenants Found
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  No tenants have been added yet. Add tenants to view their rent
                  history.
                </p>
                <Button onClick={loadTenants}>Refresh</Button>
              </div>
            )}
          </>
        ) : (
          // Rent History View
          <div className="space-y-6">
            {/* Tenant Info Summary */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-8 border border-gray-100">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {selectedTenant.user?.firstName?.charAt(0)?.toUpperCase() || 'T'}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedTenant.user?.firstName || 'Tenant'} {selectedTenant.user?.lastName || ''}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">{selectedTenant.user?.email || selectedTenant.email || '-'}</p>
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🏠</span>
                      <div>
                        <p className="text-xs text-gray-500">Room</p>
                        <p className="font-semibold text-gray-900">{selectedTenant.user?.unit || selectedTenant.unit || '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">💰</span>
                      <div>
                        <p className="text-xs text-gray-500">Monthly Rent</p>
                        <p className="font-semibold text-gray-900">₹{selectedTenant.leaseDetails?.monthlyRent || 0}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">👥</span>
                      <div>
                        <p className="text-xs text-gray-500">Members</p>
                        <p className="font-semibold text-gray-900">{selectedTenant.occupants?.length || 1}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bill Cards Grid */}
            <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Payment History</h3>
              {historyLoading ? (
                <div className="p-12 text-center">
                  <LoadingSpinner size="md" />
                  <p className="text-gray-600 mt-4">Loading rent history...</p>
                </div>
              ) : rentHistory?.data?.bills?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rentHistory?.data?.bills?.map((bill, index) => (
                    <BillCard key={bill._id || index} bill={bill} onClick={() => handleBillClick(bill)} />
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Payment History
                  </h3>
                  <p className="text-gray-600">
                    No rental payment history found for this tenant.
                  </p>
                </div>
              )}

              {/* Bill Detail Modal */}
              {selectedBill && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in">
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleCloseBillDetail}></div>
                  <div className="bg-white rounded-sm shadow-2xl p-8 max-w-2xl w-full relative z-10 animate-scale-in max-h-[90vh] overflow-y-auto">
                    <button
                      className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200"
                      onClick={handleCloseBillDetail}
                      aria-label="Close modal"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    {billDetailLoading ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <LoadingSpinner size="md" />
                        <p className="text-gray-600 mt-4">Loading bill details...</p>
                      </div>
                    ) : isEditMode ? (
                      <BillEditForm 
                        bill={billDetail?.data?.bill} 
                        formData={editFormData}
                        setFormData={setEditFormData}
                        onSave={handleSaveBillEdit}
                        onCancel={() => setIsEditMode(false)}
                        loading={actionLoading}
                      />
                    ) : billDetail ? (
                      <>
                        <BillDetailView bill={billDetail.data.bill} />
                        {/* Action Buttons */}
                        <div className="mt-8 pt-6 border-t border-gray-200 flex gap-3 justify-end">
                          <Button 
                            onClick={() => setIsDeleteConfirming(true)}
                            variant="danger"
                            size="md"
                            disabled={actionLoading}
                          >
                            🗑️ Delete Bill
                          </Button>
                          <Button 
                            onClick={handleEditBill}
                            variant="secondary"
                            size="md"
                            disabled={actionLoading}
                          >
                            ✏️ Edit Bill
                          </Button>
                          <Button 
                            onClick={() => setIsSendConfirming(true)}
                            variant="primary"
                            size="md"
                            disabled={actionLoading || billDetail?.data?.bill?.status === 'sent'}
                          >
                            📤 Send to Tenant
                          </Button>
                        </div>

                        {/* Delete Confirmation */}
                        {isDeleteConfirming && (
                          <ConfirmDialog
                            title="Delete Bill"
                            message="Are you sure you want to delete this bill? This action cannot be undone."
                            onConfirm={handleDeleteBill}
                            onCancel={() => setIsDeleteConfirming(false)}
                            loading={actionLoading}
                            variant="danger"
                          />
                        )}

                        {/* Send Confirmation */}
                        {isSendConfirming && (
                          <ConfirmDialog
                            title="Send Bill to Tenant"
                            message="This will send the bill to the tenant's registered email. Proceed?"
                            onConfirm={handleSendBill}
                            onCancel={() => setIsSendConfirming(false)}
                            loading={actionLoading}
                            variant="primary"
                          />
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-500">No details found.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    );
  };

// Bill Detail View Component
function BillDetailView({ bill }) {
  console.log("bill:", bill);
  const month = bill.billingPeriod?.month || bill.month;
  const year = bill.billingPeriod?.year || bill.year;
  const dueDate = bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : '-';
  const totalAmount = bill.totalBill || bill.total || bill.amount || 0;
  const status = bill.status || "PENDING";

  const getStatusBadgeColor = (status) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "OVERDUE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1">Bill Details</h2>
          <p className="text-sm text-gray-500">Invoice #{bill._id?.slice(-8)}</p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeColor(status)}`}>
          {status}
        </span>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-100">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Billing Period</p>
            <p className="text-2xl font-bold text-gray-900">{month ? `${month}/${year}` : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Due Date</p>
            <p className="text-2xl font-bold text-gray-900">{dueDate}</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border border-green-100">
        <p className="text-sm text-gray-600 mb-1">Total Amount Due</p>
        <p className="text-4xl font-bold text-green-700">₹{totalAmount}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Charges Breakdown</h3>
        <div className="space-y-3">
          {bill.charges?.rent && (
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="text-gray-700 font-medium">Rent</span>
              <span className="text-gray-900 font-bold">₹{bill.charges.rent}</span>
            </div>
          )}
          {bill.charges?.utilities?.water > 0 && (
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <span className="text-gray-700 font-medium">💧 Water Charges</span>
              <span className="text-gray-900 font-bold">₹{bill.charges.utilities.water}</span>
            </div>
          )}
          {bill.charges?.utilities?.electricity > 0 && (
            <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
              <span className="text-gray-700 font-medium">⚡ Electricity Charges</span>
              <span className="text-gray-900 font-bold">₹{bill.charges.utilities.electricity}</span>
            </div>
          )}
          {bill.charges?.utilities?.trash > 0 && (
            <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <span className="text-gray-700 font-medium">🗑️ Garbage Charges</span>
              <span className="text-gray-900 font-bold">₹{bill.charges.utilities.trash}</span>
            </div>
          )}
          {bill.charges?.maintenance > 0 && (
            <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <span className="text-gray-700 font-medium">🔧 Maintenance Charges</span>
              <span className="text-gray-900 font-bold">₹{bill.charges.maintenance}</span>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <p className="text-sm text-gray-500 text-center">
          For any queries, please contact your property manager
        </p>
      </div>
    </div>
  );
}

// Tenant Card Component for Selection
const TenantCard = ({ tenant, onSelect, onAddBill }) => (
  <div
    onClick={onSelect}
    className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-300 overflow-hidden group"
  >
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
      <div className="flex items-center space-x-4">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:shadow-lg transition-shadow">
          {tenant.user?.firstName?.charAt(0)?.toUpperCase() || "T"}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg">
            {tenant.user?.firstName || 'Tenant'} {tenant.user?.lastName || ''}
          </h3>
          <p className="text-sm text-gray-500">{tenant.user?.email || '-'}</p>
        </div>
        <div className="text-blue-500 group-hover:text-blue-700 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>

    <div className="p-6 space-y-3">
      <div className="flex justify-between items-center pb-3 border-b border-gray-100">
        <span className="text-sm text-gray-600">Room</span>
        <span className="font-bold text-gray-900 text-lg">{tenant.user?.unit || tenant.unit || '-'}</span>
      </div>
      <div className="flex justify-between items-center pb-3 border-b border-gray-100">
        <span className="text-sm text-gray-600">Monthly Rent</span>
        <span className="font-bold text-gray-900 text-lg">₹{tenant.leaseDetails?.monthlyRent || 0}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Members</span>
        <span className="font-bold text-gray-900 text-lg">{tenant.occupants?.length || 1}</span>
      </div>
      {/* {tenant.balance && tenant.balance !== "0" && (
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <span className="text-sm text-gray-600">Balance</span>
          <span
            className={`font-bold text-lg ${parseFloat(tenant.balance) < 0 ? "text-red-600" : "text-green-600"}`}
          >
            ₹{tenant.balance}
          </span>
        </div>
      )} */}
    </div>

    <div className="px-6 pb-6 pt-4 border-t border-gray-100 space-y-3">
      <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">
        👉 Click to view rent history
      </p>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onAddBill(tenant);
        }}
        variant="outline"
        size="sm"
        className="w-full hover:bg-blue-50 transition-colors"
      >
        + Add New Bill
      </Button>
    </div>
  </div>
);


// Bill Card Component
const BillCard = ({ bill, onClick }) => {
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return { bg: "bg-green-50", border: "border-green-200", badge: "bg-green-100 text-green-800" };
      case "PENDING":
        return { bg: "bg-yellow-50", border: "border-yellow-200", badge: "bg-yellow-100 text-yellow-800" };
      case "OVERDUE":
        return { bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-800" };
      default:
        return { bg: "bg-gray-50", border: "border-gray-200", badge: "bg-gray-100 text-gray-800" };
    }
  };

  const month = bill.billingPeriod?.month || bill.month;
  const year = bill.billingPeriod?.year || bill.year;
  const dueDate = bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : "-";
  const total = bill.totalAmount || bill.total || bill.amount || 0;
  const status = bill.status || "PENDING";
  const colors = getStatusColor(status);

  return (
    <div
      className={`border-2 rounded-2xl p-6 ${colors.bg} ${colors.border} shadow-md hover:shadow-xl cursor-pointer transition-all duration-300 hover:scale-105 group`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-gray-600 font-medium mb-1">Bill Period</p>
          <h3 className="font-bold text-2xl text-gray-900">
            {month ? `${month}/${year}` : "Bill"}
          </h3>
        </div>
        <span className={`px-4 py-2 rounded-full text-xs font-bold ${colors.badge} transition-transform group-hover:scale-110`}>
          {status}
        </span>
      </div>

      <div className="mb-4 pb-4 border-b border-gray-300">
        <p className="text-sm text-gray-600 mb-1">Amount Due</p>
        <p className="text-3xl font-bold text-gray-900">₹{total}</p>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Due Date</p>
        <p className="text-base font-semibold text-gray-900">📅 {dueDate}</p>
      </div>

      {(bill.charges?.rent || bill.charges?.utilities) && (
        <div className="bg-white bg-opacity-50 rounded-lg p-3 mb-4">
          <p className="text-xs font-semibold text-gray-600 mb-2 uppercase">Charges</p>
          <div className="space-y-1 text-sm">
            {bill.charges?.rent && (
              <div className="flex justify-between text-gray-700">
                <span>Rent</span>
                <span className="font-semibold">₹{bill.charges.rent}</span>
              </div>
            )}
            {bill.charges?.utilities?.water > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>💧 Water</span>
                <span className="font-semibold">₹{bill.charges.utilities.water}</span>
              </div>
            )}
            {bill.charges?.utilities?.electricity > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>⚡ Power</span>
                <span className="font-semibold">₹{bill.charges.utilities.electricity}</span>
              </div>
            )}
            {bill.charges?.utilities?.trash > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>🗑️ Garbage</span>
                <span className="font-semibold">₹{bill.charges.utilities.trash}</span>
              </div>
            )}
            {bill.charges?.maintenance > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>🔧 Maintenance</span>
                <span className="font-semibold">₹{bill.charges.maintenance}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="text-center pt-2">
        <p className="text-xs text-blue-600 font-semibold group-hover:text-blue-800 transition-colors">
          Click to view details →
        </p>
      </div>
    </div>
  );
};

// Bill Edit Form Component
function BillEditForm({ bill, formData, setFormData, onSave, onCancel, loading }) {
  const handleChargeChange = (chargeType, value) => {
    setFormData({
      ...formData,
      charges: {
        ...formData.charges,
        [chargeType]: parseFloat(value),
      }
    });
  };

  const handleUtilityChange = (utilityType, value) => {
    setFormData({
      ...formData,
      charges: {
        ...formData.charges,
        utilities: {
          ...(formData.charges?.utilities ?? {}),
          [utilityType]: parseFloat(value),
        }
      }
    });
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Edit Bill</h2>
      
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Charges</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rent</label>
              <input
                type="number"
                value={formData.charges?.rent ?? 0}
                onChange={(e) => handleChargeChange('rent', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter rent amount"
              />
            </div>

            <div className="border-t border-blue-200 pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Utilities</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">💧 Water</label>
                  <input
                    type="number"
                    value={formData.charges?.utilities?.water ?? 0}
                    onChange={(e) => handleUtilityChange('water', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">⚡ Electricity</label>
                  <input
                    type="number"
                    value={formData.charges?.utilities?.electricity ?? 0}
                    onChange={(e) => handleUtilityChange('electricity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">🗑️ Garbage</label>
                  <input
                    type="number"
                    value={formData.charges?.utilities?.trash ?? 0}
                    onChange={(e) => handleUtilityChange('trash', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">🔧 Maintenance</label>
                  <input
                    type="number"
                    value={formData.charges?.maintenance ?? 0}
                    onChange={(e) => handleChargeChange('maintenance', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <Button 
            onClick={onCancel}
            variant="outline"
            size="md"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={onSave}
            variant="primary"
            size="md"
            loading={loading}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

// Confirm Dialog Component
function ConfirmDialog({ title, message, onConfirm, onCancel, loading, variant = 'danger' }) {
  const getBgColor = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-50 border-red-200';
      case 'primary':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getButtonVariant = () => variant === 'danger' ? 'danger' : 'primary';

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full border ${getBgColor()}`}>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-6">{message}</p>

        <div className="flex gap-3 justify-end">
          <Button 
            onClick={onCancel}
            variant="outline"
            size="md"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            variant={getButtonVariant()}
            size="md"
            loading={loading}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RentHistoryPage;
