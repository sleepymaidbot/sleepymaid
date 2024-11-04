import { setupModuleAliases } from "@sleepymaid/shared";
setupModuleAliases();
import "module-alias/register";
import { HelperClient } from "./lib/extensions/HelperClient";

void new HelperClient().start();
