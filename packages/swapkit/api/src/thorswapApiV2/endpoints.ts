import { RequestClient } from "@swapkit/helpers";
import type { TrackerParams, TrackerResponse } from "./types";

const baseUrl = "https://api.swapkit.dev";

export function getTrackerDetails(payload: TrackerParams) {
  return RequestClient.post<TrackerResponse>(`${baseUrl}/track`, { body: JSON.stringify(payload) });
}
