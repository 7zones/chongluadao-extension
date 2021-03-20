import { put, call, takeLatest } from "redux-saga/effects";
import loGet from "lodash/get";
import { UPDATE_USER } from "../constants";
import { coreAPI } from "../../../utils/request";
import { updateUserSuccess, updateUserFail } from "../actions";

export function* doUpdateUser({ data }) {
  const url = "/users/me";
  try {
    const res = yield call(coreAPI.post, url, data);
    yield put(updateUserSuccess(res.data));
  } catch (error) {
    yield put(
      updateUserFail(
        loGet(
          error,
          "response.data.message",
          loGet(error, "response.data.error", "Something wrong")
        )
      )
    );
  }
}

export default function* watchUpdateUser() {
  yield takeLatest(UPDATE_USER, doUpdateUser);
}
