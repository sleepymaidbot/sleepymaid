import { setupModuleAliases } from "@sleepymaid/shared";
setupModuleAliases();
import "module-alias/register";
import { TestClient } from "./lib/extensions/TestClient";

void new TestClient().start();
