import Header from './Header';
import Footer from './Footer';
import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from "react";
import {updateUser} from "../../../utils/Slices/UserSlice.js"
import { useDispatch } from 'react-redux';
import axios from 'axios';

const Body = () => {
  const navigate = useNavigate();
   const dispatch = useDispatch();

  const getUser = async ()=>{
    try{
      console.log("call started");
      const userData = await axios.get('http://localhost:3000/owner/profile/view',{
        withCredentials: true,
      });
      dispatch(updateUser(userData.data.OwnerInfo));
    }catch(err){
      if (err.status == '401'){
        navigate('/login');
      }
      console.log(err);
    }
  }

  useEffect(()=>{
    getUser();
  },[]);

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