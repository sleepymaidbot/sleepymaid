import { setupModuleAliases } from "@sleepymaid/shared";
setupModuleAliases();
import "module-alias/register";
import { SleepyMaidClient } from "./lib/SleepyMaidClient";

void new SleepyMaidClient().start();
