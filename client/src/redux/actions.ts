// src/redux/actions.ts
import { Dispatch } from "redux";
import { userRequest } from "../requestMethods";
import { loginStart, loginSuccess, loginFailure } from "./userRedux";

export const login = (
  dispatch: Dispatch,
  user: { username: string; password: string }
) => {
  dispatch(loginStart());
  userRequest
    .post("/auth/login", user)
    .then((response) => {
      dispatch(loginSuccess(response.data));
    })
    .catch((error) => {
      dispatch(loginFailure());
      console.error("Login failed:", error);
    });
};
