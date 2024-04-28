import type { ListenerInterface } from "@sleepymaid/handler";
import type { SleepyMaidClient } from "../../lib/extensions/SleepyMaidClient";

export default class ErrorListener implements ListenerInterface {
  public readonly name = "error";
  public readonly once = false;

  public async execute(error: Error, client: SleepyMaidClient) {
    client.logger.error(error);
  }
}
