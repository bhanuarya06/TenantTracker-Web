import { useDispatch, useSelector } from "react-redux";
import { toggleMenu } from "../utils/Slices/MenuSlice";
import { Link } from "react-router-dom";
import MenuDropdown from "./MenuDropdown";

const Header = () => {
  const dispatch = useDispatch();
  const showMenu = useSelector((store) => store?.menu?.showMenu);
  const userFirstName = useSelector((store) => store?.user?.firstName);

  const handleMenuClick = () => {
    dispatch(toggleMenu());
  };

  return (
    <div className="">
      <div className="flex items-center justify-between shadow-lg h-20">
        <Link to="/" className="font-bold text-2xl pl-32 py-4 w-5/7">
          <div>Tenant Tracker</div>
        </Link>
        {userFirstName && (
          <div className="font-bold flex justify-center text-lg w-1/7 p-4">
            Welcome, {userFirstName}
          </div>
        )}
        <img
          alt="Hamburger Logo"
          src="/threelines.png"
          className=" w-10 mx-10"
          onClick={handleMenuClick}
        ></img>
      </div>
      {showMenu && <MenuDropdown />}
    </div>
  );
};

export default Header;
