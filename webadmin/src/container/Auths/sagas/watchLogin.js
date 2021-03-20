import { put, call, takeLatest } from "redux-saga/effects";
import loGet from "lodash/get";
import { LOG_IN } from "../constants";
import { logInSuccess, logInFail } from "../actions";
import { coreAPI, setToken } from "../../../utils/request";

export function* doLogin({ payload: { data } }) {
  const url = "/admin/auth/login";
  try {
    const resp = yield call(coreAPI.post, url, data);
    yield call(setToken, resp.access_token);
    yield put(logInSuccess(resp.data));
  } catch (err) {
    yield put(logInFail(loGet(err, "response.data.message")));
    // reject(err);
  }
}

export default function* watchLogin() {
  yield takeLatest(LOG_IN, doLogin);
}
