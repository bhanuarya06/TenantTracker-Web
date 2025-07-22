import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toggleMenu, whoIsUser } from "../utils/Slices/MenuSlice";
import { removeUser } from "../utils/Slices/UserSlice";

const MenuDropdown = () => {

  const dispatch = useDispatch();
  const user = useSelector(store=>store?.user)
  const handleTenantLogin = ()=>{
    dispatch(whoIsUser("tenant"));
    dispatch(toggleMenu());
  }
  const handleOwnerLogin = ()=>{
    dispatch(whoIsUser("owner"));
    dispatch(toggleMenu());
  }
  const handleTenantLogout = ()=>{
    dispatch(removeUser("owner"));
    dispatch(toggleMenu());
  }

  return (
    <div className="absolute pl-375 pt-1 ">
        <div className=" w-36 py-1 shadow-lg bg-white rounded-lg">
          <div className=" border-b-1 border-slate-300">
            <ul>
              <li className="p-2 hover:bg-amber-400 text-md">About</li>
              <li className="p-2 hover:bg-amber-400 text-md">Contact Us</li>
            </ul>
          </div>
          {user === null ? (<><div className="p-2 hover:bg-amber-400 border-b-1 font-bold text-md border-slate-300">
            <Link to="/login"><h1 onClick={handleOwnerLogin}>Owner Log-in</h1></Link>
          </div>
          <div className="p-2 hover:bg-amber-400 font-bold text-md">
            <Link to="/login"><h1 onClick={handleTenantLogin}>Tenant Log-in</h1></Link>
          </div></>) : (<div className="p-2 hover:bg-amber-400 font-bold text-md">
            <Link to="/login"><h1 onClick={handleTenantLogout}>Logout</h1></Link>
          </div>)}
          
          
        </div>
      </div>
  );
};

export default MenuDropdown;
