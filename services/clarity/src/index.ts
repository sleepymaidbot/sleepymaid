import moduleAlias from "module-alias";
moduleAlias.addAlias("punycode", "punycode/");

import { ClarityClient } from "./lib/ClarityClient";

void new ClarityClient().start();
