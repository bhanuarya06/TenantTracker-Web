import { useSelector } from "react-redux";
import MenuDropdown from "./MenuDropdown";

const MainPageBackground = () => {
  
  const showMenu = useSelector(store=>store?.menu?.showMenu)

  return (
    <div className="relative">
      {showMenu && <MenuDropdown />}
      <div className="">
        <img alg="bg-image" src="public/bg-image.webp" className="" ></img>
      </div>
    </div>
  );
};

export default MainPageBackground;
