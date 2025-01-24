import moduleAlias from "module-alias";
moduleAlias.addAlias("punycode", "punycode/");

import { HelperClient } from "./lib/extensions/HelperClient";

void new HelperClient().start();
