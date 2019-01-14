import ActionType from "./ActionType";

export function setOfflineMode(offlineMode) {
  return {
    type: ActionType.SET_OFFLINE_MODE,
    offlineMode: offlineMode
  }
}