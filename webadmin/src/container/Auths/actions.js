import {
  LOG_IN,
  LOG_IN_SUCCESS,
  LOG_IN_FAIL,
  LOG_OUT,
  FETCH_CURRENT_USER,
  FETCH_CURRENT_USER_FAIL,
  FETCH_CURRENT_USER_SUCCESS,
  UPDATE_USER,
  UPDATE_USER_FAIL,
  UPDATE_USER_SUCCESS,
  LOG_IN_WITH_GOOGLE,
  SET_ERROR,
} from "./constants";

export function logIn(data) {
  return { type: LOG_IN, payload: { data } };
}

export function logInWithGoogle(data) {
  return { type: LOG_IN_WITH_GOOGLE, payload: { data } };
}

export function logInSuccess(data) {
  return { type: LOG_IN_SUCCESS, payload: { data } };
}

export function logInFail(error) {
  return { type: LOG_IN_FAIL, error };
}

export function setError(value) {
  return { type: SET_ERROR, value };
}

export function logOut() {
  return { type: LOG_OUT };
}

export function fetchUser() {
  return { type: FETCH_CURRENT_USER };
}

export function fetchUserFail(error) {
  return { type: FETCH_CURRENT_USER_FAIL, payload: { error } };
}

export function fetchUserSuccess(user, permissions = []) {
  return { type: FETCH_CURRENT_USER_SUCCESS, user, permissions };
}

export function updateUser(data) {
  return { type: UPDATE_USER, data };
}

export function updateUserFail(error) {
  return { type: UPDATE_USER_FAIL, error };
}

export function updateUserSuccess(user) {
  return { type: UPDATE_USER_SUCCESS, user };
}
