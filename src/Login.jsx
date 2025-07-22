import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../utils/Slices/UserSlice";
import { useNavigate } from "react-router";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((store) => store.menu.loginUser);
  const [email,setEmail] = useState("laxmi@gmail.com");
  const [password,setPassword] = useState("Laxmi@123");

  const handleFetchUser = async (event) => {
    event.preventDefault();
    const loggedInUser = await fetch(
      `http://localhost:3000/${user}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include"
      }
    );
    const userDetails = await loggedInUser.json();
    dispatch(updateUser(userDetails));
    navigate("/")

  };

  return (
    <div className=" flex justify-center h-190">
      <div className="w-3/7 rounded-2xl text-center m-36 shadow-2xl">
        <div className="p-2 font-bold text-3xl bg-zinc-800 rounded-t-2xl text-white h-1/6 flex items-center justify-center">
          {user === "tenant" ? "Tenant Login" : "Owner Login"}
        </div>
        <form className="h-5/6 p-8">
          <h1 className="mt-2 text-left ml-38 my-2 font-bold text-xl">
            Email address
          </h1>
          <input
            type="text"
            placeholder="Enter email"
            className="w-3/5 border-1 p-4 rounded-2xl"
            onChange={(e)=>setEmail(e.target.value)}
            value={email}
          ></input>
          <h1 className="text-left ml-38 my-2 font-bold text-xl">Password</h1>
          <input
            type="text"
            placeholder="Password"
            className=" w-3/5 border-1 p-4 rounded-2xl"
            onChange={(e)=>setPassword(e.target.value)}
            value={password}
          ></input>
          <p className="text-left ml-38 my-2 text-blue-400">
            Forgot your password?
          </p>
          <button
            className="m-6 w-4/10 h-12 font-bold text-white rounded-2xl border-1 bg-blue-400"
            onClick={handleFetchUser}
          >
            {user === "tenant"
              ? "Tenant Portal Sign In"
              : "Owner Portal Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
