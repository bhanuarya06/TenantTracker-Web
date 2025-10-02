import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../utils/Slices/UserSlice";
import { useNavigate } from "react-router";
import axios from "axios";

const Profile = () => {
  const user = useSelector((store) => store.user);
  const userType = useSelector((store) => store.menu.loginUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Local state for editing
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [dob, setDob] = useState(user.dob ? user.dob.slice(0, 10) : "");
  const [gender, setGender] = useState(user.gender || "");
  const [mobile, setMobile] = useState(user.mobile || "");
  const [address, setAddress] = useState(user.address || "");
  const [bio, setBio] = useState(user.bio || "");

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `http://localhost:3000/${userType}/profile/edit`,
        {
          firstName,
          lastName,
          dob,
          gender,
          mobile,
          address,
          bio,
        },
        {
          withCredentials: true
        }
      );
      dispatch(updateUser(res.data.owner));
      navigate("/");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong. Please try again."
      );
      console.error("Profile update error:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 flex flex-col gap-4"
        onSubmit={handleUpdate}
      >
        <h2 className="font-bold text-2xl text-center mb-4 text-zinc-800">
          Edit Profile
        </h2>
        <div>
          <label className="block font-semibold mb-1" htmlFor="firstName">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            className="w-full border border-gray-300 p-3 rounded-lg"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1" htmlFor="lastName">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            className="w-full border border-gray-300 p-3 rounded-lg"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1" htmlFor="dob">
            Date of Birth
          </label>
          <input
            id="dob"
            type="date"
            className="w-full border border-gray-300 p-3 rounded-lg"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1" htmlFor="gender">
            Gender
          </label>
          <select
            id="gender"
            className="w-full border border-gray-300 p-3 rounded-lg"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1" htmlFor="mobile">
            Mobile
          </label>
          <input
            id="mobile"
            type="tel"
            className="w-full border border-gray-300 p-3 rounded-lg"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1" htmlFor="address">
            Address
          </label>
          <input
            id="address"
            type="text"
            className="w-full border border-gray-300 p-3 rounded-lg"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1" htmlFor="bio">
            Bio
          </label>
          <textarea
            id="bio"
            className="w-full border border-gray-300 p-3 rounded-lg"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 font-bold text-white rounded-lg bg-blue-500 hover:bg-blue-600 transition"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default Profile;
