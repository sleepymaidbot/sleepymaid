import moduleAlias from "module-alias"

moduleAlias.addAlias("punycode", "punycode/")

import { SleepyMaidClient } from "./lib/SleepyMaidClient"

void new SleepyMaidClient().start()
