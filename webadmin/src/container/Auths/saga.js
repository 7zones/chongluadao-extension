import { all } from "redux-saga/effects";
import watchLogin from "./sagas/watchLogin";
import watchLogout from "./sagas/watchLogout";
import watchFetchUser from "./sagas/watchFetchUser";
import watchUpdateUser from "./sagas/watchUpdateUser";

export default function* watchAll() {
  yield all([watchLogin(), watchLogout(), watchFetchUser(), watchUpdateUser()]);
}
