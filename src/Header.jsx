import { useDispatch } from "react-redux";
import { toggleMenu } from "../utils/Slices/MenuSlice";
import { Link } from "react-router-dom";


const Header = () => {

  const dispatch = useDispatch();

  const handleMenuClick = ()=>{
    dispatch(toggleMenu());
  }

  return (
    <div className="">
      <div className="flex items-center justify-between shadow-lg h-20">
        <Link to="/" className="font-bold text-2xl pl-32 py-4 w-5/6"><div >Tenant Tracker</div></Link>
        <div className="w-1/6 p-4">
          <img alt="Hamburger Logo" src="/threelines.png" className="flex items-center w-10 " onClick={handleMenuClick} ></img>
        </div>
      </div>
    </div>
  );
};

export default Header;
