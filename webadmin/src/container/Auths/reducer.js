import produce from "immer";
import {
  LOG_IN_SUCCESS,
  LOG_OUT,
  FETCH_CURRENT_USER,
  FETCH_CURRENT_USER_SUCCESS,
  FETCH_CURRENT_USER_FAIL,
  LOG_IN_FAIL,
  UPDATE_USER_SUCCESS,
  UPDATE_USER,
  UPDATE_USER_FAIL,
  SET_ERROR,
} from "./constants";

export const initialState = {
  error: null,
  global: true,
  isLogin: !!window.localStorage.getItem("token"),
  user: null,
  userIsLoading: false,
  userLoadError: null,
  permissions: [],
};

/* eslint-disable default-case, no-param-reassign */
const authReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case LOG_IN_SUCCESS:
        draft.isLogin = true;
        draft.error = null;
        break;
      case LOG_IN_FAIL:
        draft.error = action.error;
        break;
      case SET_ERROR:
        draft.error = action.value;
        break;
      case LOG_OUT:
        draft.isLogin = false;
        break;
      case FETCH_CURRENT_USER:
        draft.userIsLoading = true;
        draft.userLoadError = null;
        break;
      case FETCH_CURRENT_USER_SUCCESS:
        draft.userIsLoading = false;
        draft.userLoadError = null;
        draft.permissions = action.permissions;
        draft.user = action.user;
        break;
      case FETCH_CURRENT_USER_FAIL:
        draft.userIsLoading = false;
        draft.userLoadError = action.payload.error;
        break;

      case UPDATE_USER:
        draft.userIsLoading = true;
        draft.userLoadError = null;
        break;
      case UPDATE_USER_SUCCESS:
        draft.userIsLoading = false;
        draft.userLoadError = null;
        draft.user = action.user;
        break;
      case UPDATE_USER_FAIL:
        draft.userIsLoading = false;
        draft.userLoadError = action.error;
        break;
    }
  });
export default authReducer;
