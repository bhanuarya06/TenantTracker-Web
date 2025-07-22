import { createSlice } from "@reduxjs/toolkit";

const UserSlice = createSlice({
    name : 'user',
    initialState:null,
    reducers:{
        updateUser:(state,action)=>{
            return action.payload;
        },
        removeUser:()=>{
            return null;
        }
    }
});

export const {updateUser, removeUser} = UserSlice.actions;
export default UserSlice.reducer;