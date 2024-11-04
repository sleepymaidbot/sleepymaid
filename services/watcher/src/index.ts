import { setupModuleAliases } from "@sleepymaid/shared";
setupModuleAliases();
import "module-alias/register";
import { WatcherClient } from "./lib/extensions/WatcherClient";

void new WatcherClient().start();
