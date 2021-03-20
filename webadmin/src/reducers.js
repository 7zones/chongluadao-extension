import { combineReducers } from "redux";
import authsReducer from "./container/Auths/reducer";

export default function createReducer(injectedReducers = {}) {
  const appReducer = combineReducers({
    auths: authsReducer,
    ...injectedReducers,
  });

  const rootReducer = (state, action) => {
    return appReducer(state, action);
  };

  return rootReducer;
}
