import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toggleMenu, whoIsUser } from "../../utils/Slices/MenuSlice";
import { removeUser } from "../../utils/Slices/UserSlice";
import axios from "axios";

const MenuDropdown = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleTenantLogout = async () => {
    dispatch(removeUser());
    dispatch(toggleMenu());
    await axios.post('http://localhost:3000/logout',{
      withCredentials : true
    });
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
          <Link to="/contact"><li className="p-2 hover:bg-amber-400 text-md cursor-pointer">
            Contact Us
          </li></Link>
        </ul>
        <div className="border-t border-slate-200 mt-2 pt-2">
          <button
            className="w-full text-left p-2 hover:bg-amber-400 font-bold text-md rounded"
            onClick={handleTenantLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuDropdown;
