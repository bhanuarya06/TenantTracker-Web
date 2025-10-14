import React, { useState } from "react";

const options = [
  { key: "home", label: "Home" },
  { key: "viewTenants", label: "View Tenants" },
  { key: "addTenant", label: "Add Tenant" },
  // Add more options as needed
];

const MainPageBackground = () => {
  const [selected, setSelected] = useState("home");

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col py-8 px-4">
        <h2 className="font-bold text-2xl mb-8 text-blue-600">Dashboard</h2>
        <nav className="flex flex-col gap-4">
          {options.map(opt => (
            <button
              key={opt.key}
              className={`text-left px-4 py-2 rounded-lg font-medium transition ${
                selected === opt.key
                  ? "bg-blue-500 text-white"
                  : "hover:bg-blue-100 text-gray-700"
              }`}
              onClick={() => setSelected(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        {selected === "home" && (
          <div className="w-full flex flex-col items-center">
            <img
              alt="bg-image"
              src="/bg-image.webp"
              className="w-96 h-64 object-cover rounded-xl shadow-md mb-6"
            />
            <h1 className="text-3xl font-bold mb-2">Welcome Home!</h1>
            <p className="text-gray-600">This is your home dashboard.</p>
          </div>
        )}
        {selected === "viewTenants" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">View Tenants</h1>
            {/* Replace with your tenants list component */}
            <p>List of tenants will appear here.</p>
          </div>
        )}
        {selected === "addTenant" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Add Tenant</h1>
            {/* Replace with your add tenant form/component */}
            <p>Form to add a new tenant will appear here.</p>
          </div>
        )}
        {/* Add more content sections as needed */}
      </main>
    </div>
  );
};

export default MainPageBackground;