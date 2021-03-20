import { put, call, takeLatest } from "redux-saga/effects";
import { FETCH_CURRENT_USER } from "../constants";
import { coreAPI } from "../../../utils/request";
import { fetchUserSuccess, logOut } from "../actions";

export function* doFetchUser() {
  const url = "/admin/user/me";
  try {
    const res = yield call(coreAPI.get, url);
    yield put(fetchUserSuccess(res.data));
  } catch (err) {
    yield put(logOut());
  }
}

export default function* watchFetchUser() {
  yield takeLatest(FETCH_CURRENT_USER, doFetchUser);
}
