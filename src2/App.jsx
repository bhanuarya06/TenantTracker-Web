import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { OAuthCallbackPage } from "./pages/auth/OAuthCallbackPage";
import { ProfilePage } from "./pages/user/ProfilePage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import PropertiesPage from "./pages/properties/PropertiesPage";
import AddPropertyPage from "./pages/properties/AddPropertyPage";
import TenantsPage from "./pages/tenants/TenantsPage";
import AddTenantPage from "./pages/tenants/AddTenantPage";
import TenantProfilePage from "./pages/tenants/TenantProfilePage";
import RentHistoryPage from "./pages/tenants/RentHistoryPage";
import AddBillPage from "./pages/tenants/AddBillPage";
import { ContactPage } from "./pages/ContactPage";
import { NotFoundPage } from "./pages/NotFoundPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route
            path="auth/callback/:provider"
            element={<OAuthCallbackPage />}
          />
          <Route path="contact" element={<ContactPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="properties" element={<PropertiesPage />} />
            <Route path="add-property" element={<AddPropertyPage />} />
            <Route path="edit-property/:id" element={<AddPropertyPage />} />
            <Route path="tenants" element={<TenantsPage />} />
            <Route path="tenant/:id" element={<TenantProfilePage />} />
            <Route path="addtenant" element={<AddTenantPage />} />
            <Route path="edittenant/:id" element={<AddTenantPage />} />
            <Route path="rent-history" element={<RentHistoryPage />} />
            <Route path="add-bill/:id" element={<AddBillPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 900,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />
    </>
  );
}

export default App;
