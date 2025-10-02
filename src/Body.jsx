import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router';

const Body = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default Body;