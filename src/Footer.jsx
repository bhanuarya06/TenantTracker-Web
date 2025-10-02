const Footer = () => {
  return (
    <footer className="w-full bg-gray-700 text-white mt-8">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-gray-500 pb-6">
          <div>
            <h1 className="font-bold text-lg mb-2">Tenant Tracker</h1>
            <p className="text-sm opacity-80">
              We build, renovate and manage great apartments for rent and take pride in caring for our properties and our residents in Building.
            </p>
          </div>
          <div>
            <h1 className="font-bold text-lg mb-2">RENT</h1>
            <ul className="space-y-1">
              <li className="hover:text-amber-400 cursor-pointer">Home</li>
              <li className="hover:text-amber-400 cursor-pointer">View Apartments</li>
              <li className="hover:text-amber-400 cursor-pointer">Office Locations</li>
            </ul>
          </div>
          <div>
            <h1 className="font-bold text-lg mb-2">COMPANY</h1>
            <ul className="space-y-1">
              <li className="hover:text-amber-400 cursor-pointer">About Us</li>
              <li className="hover:text-amber-400 cursor-pointer">Our Regions</li>
              <li className="hover:text-amber-400 cursor-pointer">Commercial Properties</li>
              <li className="hover:text-amber-400 cursor-pointer">Tenant Tracker Blog</li>
            </ul>
          </div>
          <div>
            <h1 className="font-bold text-lg mb-2">RESOURCES</h1>
            <ul className="space-y-1">
              <li className="hover:text-amber-400 cursor-pointer">Careers</li>
              <li className="hover:text-amber-400 cursor-pointer">Our Guarantee</li>
              <li className="hover:text-amber-400 cursor-pointer">Terms of Use</li>
              <li className="hover:text-amber-400 cursor-pointer">Privacy Policy</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-xs opacity-70 pt-4">
          © 2025 Tenant Tracker, LLC. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;