import { Dispatch } from "@reduxjs/toolkit";
import { loginFailure, loginStart, loginSuccess } from "./userRedux";
import { publicRequest } from "../requestMethods";

// Define el tipo de usuario (ajusta los campos según tus necesidades)
interface User {
  username: string;
  password: string;
}

export const login = async (dispatch: Dispatch, user: User) => {
  dispatch(loginStart());
  try {
    const res = await publicRequest.post("/auth/login", user);
    dispatch(loginSuccess(res.data));
  } catch (err) {
    dispatch(loginFailure());
  }
};
