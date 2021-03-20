import { initialState } from "./reducer";
import { createSelector } from "reselect";

const authState = state => state.auth || initialState;

export const makeSelectAuth = () =>
  createSelector(
    authState,
    auth => auth
  );

export const makeSelectIsLogin = () =>
  createSelector(
    authState,
    auth => auth.isLogin
  );

export const makeSelectError = () =>
  createSelector(
    authState,
    auth => auth.error
  );

export const makeSelectUser = () =>
  createSelector(
    authState,
    auth => auth.user
  );

export const makeSelectUserIsLoading = () =>
  createSelector(
    authState,
    auth => auth.userIsLoading
  );

export const makeSelectUserError = () =>
  createSelector(
    authState,
    auth => auth.userLoadError
  );

export const makeSelectPermission = () =>
  createSelector(
    authState,
    auth => auth.permissions
  );
