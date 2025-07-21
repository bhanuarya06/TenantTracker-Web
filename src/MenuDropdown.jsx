
const MenuDropdown = () => {
  return (
    <div className="absolute pl-375 pt-1 ">
        <div className=" w-36 py-1 shadow-lg bg-white rounded-lg">
          <div className=" border-b-1 border-slate-300">
            <ul>
              <li className="p-2 hover:bg-amber-400 text-md">About</li>
              <li className="p-2 hover:bg-amber-400 text-md">Contact Us</li>
            </ul>
          </div>
          <div className="p-2 hover:bg-amber-400 border-b-1 font-bold text-md border-slate-300">
            <h1>Owner Log-in</h1>
          </div>
          <div className="p-2 hover:bg-amber-400 font-bold text-md">
            <h1>Tenant Log-in</h1>
          </div>
        </div>
      </div>
  );
};

export default MenuDropdown;
