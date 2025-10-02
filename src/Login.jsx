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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("chandra@gmail.com");
  const [password, setPassword] = useState("Chandra@123");
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

  // Shared input styles
  const inputClass =
    "w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition";

  // Shared label styles
  const labelClass = "block text-left font-semibold text-gray-700 my-1";

  // Shared form wrapper
  const formWrapper =
    "w-full max-w-lg bg-white rounded-2xl shadow-2xl p-4 flex flex-col gap-2";

  // Shared button styles
  const buttonClass =
    "w-full py-3 mt-4 font-bold text-white rounded-lg bg-blue-500 hover:bg-blue-600 cursor-pointer transition";

  // Shared link styles
  const linkClass =
    "text-blue-500 hover:underline hover:text-blue-700 cursor-pointer inline-block mt-2";

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className={formWrapper}>
        <div className="font-bold text-xl bg-zinc-800 rounded-t-2xl text-white py-2 mb-2 text-center">
          {user === "tenant"
            ? newUser
              ? "Tenant Sign Up"
              : "Tenant Login"
            : newUser
            ? "Owner Sign Up"
            : "Owner Login"}
        </div>
        <form onSubmit={newUser ? handleSignUpUser : handleFetchUser}>
          {newUser && (
            <>
              <div>
                <label className={labelClass} htmlFor="firstName">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="Enter first name"
                  className={inputClass}
                  onChange={(e) => setFirstName(e.target.value)}
                  value={firstName}
                  required
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="lastName">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Enter last name"
                  className={inputClass}
                  onChange={(e) => setLastName(e.target.value)}
                  value={lastName}
                  required
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="dob">
                  Date of Birth
                </label>
                <input
                  id="dob"
                  type="date"
                  className={inputClass}
                  onChange={(e) => setDob(e.target.value)}
                  value={dob}
                  required
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="gender">
                  Gender
                </label>
                <select
                  id="gender"
                  className={inputClass}
                  onChange={(e) => setGender(e.target.value)}
                  value={gender}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="mobile">
                  Mobile
                </label>
                <input
                  id="mobile"
                  type="tel"
                  placeholder="Enter mobile number"
                  className={inputClass}
                  onChange={(e) => setMobile(e.target.value)}
                  value={mobile}
                  required
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="bio">
                  Bio
                </label>
                <textarea
                  id="bio"
                  placeholder="Tell us about yourself"
                  className={inputClass}
                  onChange={(e) => setBio(e.target.value)}
                  value={bio}
                  rows={2}
                />
              </div>
            </>
          )}
          <div>
            <label className={labelClass} htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter email"
              className={inputClass}
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              className={inputClass}
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            {newUser ? (
              <span
                className={linkClass}
                tabIndex={0}
                role="button"
                onClick={() => dispatch(addUser())}
                onKeyPress={(e) => {
                  if (e.key === "Enter" || e.key === " ") dispatch(addUser());
                }}
              >
                Existing user? Click here to Sign In
              </span>
            ) : (
              <span
                className={linkClass}
                tabIndex={0}
                role="button"
                onClick={() => dispatch(addUser())}
                onKeyPress={(e) => {
                  if (e.key === "Enter" || e.key === " ") dispatch(addUser());
                }}
              >
                New user? Click here to Register
              </span>
            )}
          </div>
          <button type="submit" className={buttonClass}>
            {user === "tenant"
              ? newUser
                ? "Tenant Portal Sign Up"
                : "Tenant Portal Sign In"
              : newUser
              ? "Owner Portal Sign Up"
              : "Owner Portal Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;