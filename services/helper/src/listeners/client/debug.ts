import type { ListenerInterface } from "@sleepymaid/handler";
import type { HelperClient } from "../../lib/extensions/HelperClient";

export default class DebugListener implements ListenerInterface {
  public readonly name = "debug";
  public readonly once = false;

  public async execute(info: string, client: HelperClient) {
    //if (client.config.nodeEnv === 'dev')
    client.logger.debug(info);
  }
}
