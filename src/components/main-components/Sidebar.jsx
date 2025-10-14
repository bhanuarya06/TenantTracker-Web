// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";

const Sidebar = () => (
  <aside className="w-64 bg-white shadow-lg flex flex-col py-8 px-4">
    <h2 className="font-bold text-2xl mb-8 text-blue-600">Dashboard</h2>
    <nav className="flex flex-col gap-4">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `text-left px-4 py-2 rounded-lg font-medium transition ${
            isActive ? "bg-blue-500 text-white" : "hover:bg-blue-100 text-gray-700"
          }`
        }
        end
      >
        Home
      </NavLink>
      <NavLink
        to="/viewTenants"
        className={({ isActive }) =>
          `text-left px-4 py-2 rounded-lg font-medium transition ${
            isActive ? "bg-blue-500 text-white" : "hover:bg-blue-100 text-gray-700"
          }`
        }
      >
        View Tenants
      </NavLink>
      <NavLink
        to="/addTenant"
        className={({ isActive }) =>
          `text-left px-4 py-2 rounded-lg font-medium transition ${
            isActive ? "bg-blue-500 text-white" : "hover:bg-blue-100 text-gray-700"
          }`
        }
      >
        Add Tenant
      </NavLink>
      {/* Add more links as needed */}
    </nav>
  </aside>
);

export default Sidebar;