import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../utils/Slices/UserSlice";
import { useNavigate } from "react-router";
import { addUser } from "../utils/Slices/MenuSlice";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const newUser = useSelector((store) => store.menu.newUser);
  const user = useSelector((store) => store.menu.loginUser);
  const [firstName, setFirstName] = useState("Virat");
  const [lastName, setLastName] = useState("Kohli");
  const [email, setEmail] = useState("virat@gmail.com");
  const [password, setPassword] = useState("Virat@123");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [mobile, setMobile] = useState("");
  const [bio, setBio] = useState("");

  const handleSignUpUser = async (e) => {
    e.preventDefault();
    const signedUpUser = await fetch(
      `http://localhost:3000/${user}/auth/signUp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          dob,
          gender,
          mobile,
          bio,
        }),
        credentials: "include",
      }
    );
    const userDetails = await signedUpUser.json();
    dispatch(updateUser(userDetails));
    navigate("/");
  };

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
        credentials: "include",
      }
    );
    const userDetails = await loggedInUser.json();
    dispatch(updateUser(userDetails));
    navigate("/");
  };

  return newUser === true ? (
    <div className="flex justify-center h-200">
      <div className="w-3/7 rounded-2xl text-center m-10 shadow-2xl">
        <div className="p-2 font-bold text-3xl bg-zinc-800 rounded-t-2xl text-white h-1/8 flex items-center justify-center">
          {user === "tenant" ? "Tenant Sign Up" : "Owner Sign Up"}
        </div>
        <form className="h-7/8 p-8">
          <div className="flex items-center my-2">
            <label
              className="w-1/3 text-left font-bold text-xl"
              htmlFor="firstName"
            >
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="Enter first name"
              className="w-2/3 border-1 p-2 rounded-2xl"
              onChange={(e) => setFirstName(e.target.value)}
              value={firstName}
            />
          </div>
          <div className="flex items-center my-2">
            <label
              className="w-1/3 text-left font-bold text-xl"
              htmlFor="lastName"
            >
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              placeholder="Enter last name"
              className="w-2/3 border-1 p-2 rounded-2xl"
              onChange={(e) => setLastName(e.target.value)}
              value={lastName}
            />
          </div>
          <div className="flex items-center my-2">
            <label className="w-1/3 text-left font-bold text-xl" htmlFor="dob">
              Date of Birth
            </label>
            <input
              id="dob"
              type="date"
              className="w-2/3 border-1 p-2 rounded-2xl"
              onChange={(e) => setDob(e.target.value)}
              value={dob}
            />
          </div>
          <div className="flex items-center my-2">
            <label
              className="w-1/3 text-left font-bold text-xl"
              htmlFor="gender"
            >
              Gender
            </label>
            <select
              id="gender"
              className="w-2/3 border-1 p-2 rounded-2xl"
              onChange={(e) => setGender(e.target.value)}
              value={gender}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex items-center my-2">
            <label
              className="w-1/3 text-left font-bold text-xl"
              htmlFor="mobile"
            >
              Mobile
            </label>
            <input
              id="mobile"
              type="tel"
              placeholder="Enter mobile number"
              className="w-2/3 border-1 p-2 rounded-2xl"
              onChange={(e) => setMobile(e.target.value)}
              value={mobile}
            />
          </div>
          <div className="flex items-center my-2">
            <label className="w-1/3 text-left font-bold text-xl" htmlFor="bio">
              Bio
            </label>
            <textarea
              id="bio"
              placeholder="Tell us about yourself"
              className="w-2/3 border-1 p-2 rounded-2xl"
              onChange={(e) => setBio(e.target.value)}
              value={bio}
            />
          </div>
          <div className="flex items-center my-2">
            <label
              className="w-1/3 text-left font-bold text-xl"
              htmlFor="email"
            >
              Email address
            </label>
            <input
              id="email"
              type="text"
              placeholder="Enter email"
              className="w-2/3 border-1 p-2 rounded-2xl"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>
          <div className="flex items-center my-2">
            <label
              className="w-1/3 text-left font-bold text-xl"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="text"
              placeholder="Password"
              className="w-2/3 border-1 p-2 rounded-2xl"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>
          <div className="flex items-center my-2">
            <span className="w-1/3"></span>
            <p
              className="text-left text-blue-400 hover:underline hover:cursor-pointer inline"
              onClick={() => dispatch(addUser())}
              tabIndex={0}
              role="button"
              onKeyPress={(e) => {
                if (e.key === "Enter" || e.key === " ") dispatch(addUser());
              }}
            >
              Existing user? Click here to Sign In
            </p>
          </div>
          <button
            className="m-6 w-4/10 h-12 font-bold text-white rounded-2xl border-1 bg-blue-400"
            onClick={handleSignUpUser}
          >
            {user === "tenant"
              ? "Tenant Portal Sign Up"
              : "Owner Portal Sign Up"}
          </button>
        </form>
      </div>
    </div>
  ) : (
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
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          ></input>
          <h1 className="text-left ml-38 my-2 font-bold text-xl">Password</h1>
          <input
            type="text"
            placeholder="Password"
            className=" w-3/5 border-1 p-4 rounded-2xl"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          ></input>
          <div className="flex items-center my-2">
            <span className="w-1/3"></span>
            <p
              className="text-left text-blue-400 hover:underline hover:cursor-pointer inline"
              onClick={() => dispatch(addUser())}
              tabIndex={0}
              role="button"
              onKeyPress={(e) => {
                if (e.key === "Enter" || e.key === " ") dispatch(addUser());
              }}
            >
              New user? Click here to Register
            </p>
          </div>
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
