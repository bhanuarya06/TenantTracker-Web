
const MenuDropdown = () => {
  return (
    <div className="absolute pl-375 pt-2">
        <div className=" p-2 w-36 shadow-lg bg-white rounded-lg">
          <div className=" p-2 border-b-1 border-slate-300">
            <ul>
              <li>About</li>
              <li>Contact Us</li>
            </ul>
          </div>
          <div className="p-2 border-b-1 border-slate-300">
            <h1>Owner Log-in</h1>
          </div>
          <div className=" p-2">
            <h1>Tenant Log-in</h1>
          </div>
        </div>
      </div>
  );
};

export default MenuDropdown;
