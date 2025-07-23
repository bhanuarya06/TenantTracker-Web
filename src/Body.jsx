import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router';

const Body = () => {

  return (
    <div>
      <Header />
      <Outlet />
    </div>
  )
}

export default Body