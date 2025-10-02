import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toggleMenu, whoIsUser } from "../utils/Slices/MenuSlice";
import { removeUser } from "../utils/Slices/UserSlice";

const MenuDropdown = () => {
  const dispatch = useDispatch();
  const user = useSelector((store) => store?.user?.firstName);
  const navigate = useNavigate();

  const handleTenantLogin = () => {
    dispatch(whoIsUser("tenant"));
    dispatch(toggleMenu());
  };
  const handleOwnerLogin = () => {
    dispatch(whoIsUser("owner"));
    dispatch(toggleMenu());
  };
  const handleTenantLogout = () => {
    dispatch(removeUser());
    dispatch(toggleMenu());
    navigate("/login");
  };

  return (
    <div className="absolute right-26 mt-1 z-50">
      <div className="w-44 py-2 shadow-lg bg-white rounded-lg border border-gray-200">
        <ul>
          <Link to="/profile"><li className="p-2 hover:bg-amber-400 text-md cursor-pointer">
            Profile
          </li></Link>
          <li className="p-2 hover:bg-amber-400 text-md cursor-pointer">
            About
          </li>
          <li className="p-2 hover:bg-amber-400 text-md cursor-pointer">
            Contact Us
          </li>
        </ul>
        <div className="border-t border-slate-200 mt-2 pt-2">
          <button
            className="w-full text-left p-2 hover:bg-amber-400 font-bold text-md rounded"
            onClick={handleTenantLogout}
          >
            <Link to="/login">Logout</Link>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuDropdown;
