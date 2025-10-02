import { useDispatch, useSelector } from "react-redux";
import { toggleMenu, whoIsUser } from "../utils/Slices/MenuSlice";
import { Link } from "react-router-dom";
import MenuDropdown from "./MenuDropdown";

const Header = () => {
  const dispatch = useDispatch();
  const showMenu = useSelector((store) => store?.menu?.showMenu);
  const userFirstName = useSelector((store) => store?.user?.firstName);

  const handleMenuClick = () => {
    dispatch(toggleMenu());
  };

  const handleTenantLogin = () => {
    dispatch(whoIsUser("tenant"));
  };
  const handleOwnerLogin = () => {
    dispatch(whoIsUser("owner"));
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-md">
      <div className="max-w-7xl mx-auto flex place-items-center justify-between h-20 px-6">
        <Link
          to="/"
          className="flex items-center font-bold text-2xl text-gray-800 hover:text-blue-600 transition"
        >
          Tenant Tracker
        </Link>
        {userFirstName ? (
          <div className="ml-180">
            {userFirstName && (
              <div className="font-semibold text-lg text-gray-700">
                Welcome, {userFirstName}
              </div>
            )}
          </div>
        ) : (
          <div className="ml-150">
            <button
              className=" text-left p-2 hover:bg-amber-400 font-bold text-md rounded "
              onClick={handleOwnerLogin}
            >
              <Link to="/login">Owner Log-in</Link>
            </button>
            <button
              className=" text-left p-2 hover:bg-amber-400 font-bold text-md rounded"
              onClick={handleTenantLogin}
            >
              <Link to="/login">Tenant Log-in</Link>
            </button>
          </div>
        )}
        {userFirstName && <div className="flex items-center gap-4">
          <button
            aria-label="Open menu"
            onClick={handleMenuClick}
            className="focus:outline-none hover:bg-gray-100 rounded-full p-2 transition"
          >
            <img alt="Open menu" src="/threelines.png" className="w-8 h-8" />
          </button>
        </div>}
      </div>
      {showMenu && <MenuDropdown />}
    </header>
  );
};

export default Header;
