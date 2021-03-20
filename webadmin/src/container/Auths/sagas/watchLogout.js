import { takeLatest, all, call } from "redux-saga/effects";
import { LOG_OUT } from "../constants";
import { removeToken } from "../../../utils/request";

export function* doLogout() {
  try {
    yield all([call(removeToken)]);
  } catch (err) {
    console.log(err);
  }
}

export default function* watchLogout() {
  yield takeLatest(LOG_OUT, doLogout);
}
