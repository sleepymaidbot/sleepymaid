import { setupModuleAliases } from "@sleepymaid/shared";
setupModuleAliases();
import "module-alias/register";
import { SleepyMaidClient } from "./lib/extensions/SleepyMaidClient";

void new SleepyMaidClient().start();
