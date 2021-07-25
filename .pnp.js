#!/usr/bin/env node

/* eslint-disable max-len, flowtype/require-valid-file-annotation, flowtype/require-return-type */
/* global packageInformationStores, null, $$SETUP_STATIC_TABLES */

// Used for the resolveUnqualified part of the resolution (ie resolving folder/index.js & file extensions)
// Deconstructed so that they aren't affected by any fs monkeypatching occuring later during the execution
const {statSync, lstatSync, readlinkSync, readFileSync, existsSync, realpathSync} = require('fs');

const Module = require('module');
const path = require('path');
const StringDecoder = require('string_decoder');

const ignorePattern = null ? new RegExp(null) : null;

const pnpFile = path.resolve(__dirname, __filename);
const builtinModules = new Set(Module.builtinModules || Object.keys(process.binding('natives')));

const topLevelLocator = {name: null, reference: null};
const blacklistedLocator = {name: NaN, reference: NaN};

// Used for compatibility purposes - cf setupCompatibilityLayer
const patchedModules = [];
const fallbackLocators = [topLevelLocator];

// Matches backslashes of Windows paths
const backwardSlashRegExp = /\\/g;

// Matches if the path must point to a directory (ie ends with /)
const isDirRegExp = /\/$/;

// Matches if the path starts with a valid path qualifier (./, ../, /)
// eslint-disable-next-line no-unused-vars
const isStrictRegExp = /^\.{0,2}\//;

// Splits a require request into its components, or return null if the request is a file path
const pathRegExp = /^(?![a-zA-Z]:[\\\/]|\\\\|\.{0,2}(?:\/|$))((?:@[^\/]+\/)?[^\/]+)\/?(.*|)$/;

// Keep a reference around ("module" is a common name in this context, so better rename it to something more significant)
const pnpModule = module;

/**
 * Used to disable the resolution hooks (for when we want to fallback to the previous resolution - we then need
 * a way to "reset" the environment temporarily)
 */

let enableNativeHooks = true;

/**
 * Simple helper function that assign an error code to an error, so that it can more easily be caught and used
 * by third-parties.
 */

function makeError(code, message, data = {}) {
  const error = new Error(message);
  return Object.assign(error, {code, data});
}

/**
 * Ensures that the returned locator isn't a blacklisted one.
 *
 * Blacklisted packages are packages that cannot be used because their dependencies cannot be deduced. This only
 * happens with peer dependencies, which effectively have different sets of dependencies depending on their parents.
 *
 * In order to deambiguate those different sets of dependencies, the Yarn implementation of PnP will generate a
 * symlink for each combination of <package name>/<package version>/<dependent package> it will find, and will
 * blacklist the target of those symlinks. By doing this, we ensure that files loaded through a specific path
 * will always have the same set of dependencies, provided the symlinks are correctly preserved.
 *
 * Unfortunately, some tools do not preserve them, and when it happens PnP isn't able anymore to deduce the set of
 * dependencies based on the path of the file that makes the require calls. But since we've blacklisted those paths,
 * we're able to print a more helpful error message that points out that a third-party package is doing something
 * incompatible!
 */

// eslint-disable-next-line no-unused-vars
function blacklistCheck(locator) {
  if (locator === blacklistedLocator) {
    throw makeError(
      `BLACKLISTED`,
      [
        `A package has been resolved through a blacklisted path - this is usually caused by one of your tools calling`,
        `"realpath" on the return value of "require.resolve". Since the returned values use symlinks to disambiguate`,
        `peer dependencies, they must be passed untransformed to "require".`,
      ].join(` `)
    );
  }

  return locator;
}

let packageInformationStores = new Map([
  ["discord-akairo", new Map([
    ["8.2.2", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-discord-akairo-8.2.2-ad4663a2d03b8839ab02a46a59a76fb5a92383c9/node_modules/discord-akairo/"),
      packageDependencies: new Map([
        ["discord-akairo", "8.2.2"],
      ]),
    }],
  ])],
  ["discord-api-types", new Map([
    ["0.20.2", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-discord-api-types-0.20.2-ab1951b7b92743d790508eb2c5480ccbf74928bd/node_modules/discord-api-types/"),
      packageDependencies: new Map([
        ["discord-api-types", "0.20.2"],
      ]),
    }],
    ["0.18.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-discord-api-types-0.18.1-5d08ed1263236be9c21a22065d0e6b51f790f492-integrity/node_modules/discord-api-types/"),
      packageDependencies: new Map([
        ["discord-api-types", "0.18.1"],
      ]),
    }],
    ["0.19.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-discord-api-types-0.19.0-86ba8021b29190cf860e90a2bc3e29b1d7aab3ba-integrity/node_modules/discord-api-types/"),
      packageDependencies: new Map([
        ["discord-api-types", "0.19.0"],
      ]),
    }],
  ])],
  ["discord.js", new Map([
    ["13.0.0-dev.4886ae2.1627214570", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-discord-js-13.0.0-dev.4886ae2.1627214570-efe856ceb02b9c774508337270f16e9a11ff2128-integrity/node_modules/discord.js/"),
      packageDependencies: new Map([
        ["@discordjs/builders", "0.2.0"],
        ["@discordjs/collection", "0.1.6"],
        ["@discordjs/form-data", "3.0.1"],
        ["@sapphire/async-queue", "1.1.4"],
        ["@types/ws", "7.4.7"],
        ["abort-controller", "3.0.0"],
        ["discord-api-types", "0.19.0"],
        ["node-fetch", "2.6.1"],
        ["ws", "7.5.3"],
        ["discord.js", "13.0.0-dev.4886ae2.1627214570"],
      ]),
    }],
  ])],
  ["@discordjs/builders", new Map([
    ["0.2.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-@discordjs-builders-0.2.0-832c8d894aad13362db7a99f11a7826b21e4cd94-integrity/node_modules/@discordjs/builders/"),
      packageDependencies: new Map([
        ["discord-api-types", "0.18.1"],
        ["tslib", "2.3.0"],
        ["@discordjs/builders", "0.2.0"],
      ]),
    }],
  ])],
  ["tslib", new Map([
    ["2.3.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-tslib-2.3.0-803b8cdab3e12ba581a4ca41c8839bbb0dacb09e-integrity/node_modules/tslib/"),
      packageDependencies: new Map([
        ["tslib", "2.3.0"],
      ]),
    }],
    ["1.14.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-tslib-1.14.1-cf2d38bdc34a134bcaf1091c41f6619e2f672d00-integrity/node_modules/tslib/"),
      packageDependencies: new Map([
        ["tslib", "1.14.1"],
      ]),
    }],
  ])],
  ["@discordjs/collection", new Map([
    ["0.1.6", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-@discordjs-collection-0.1.6-9e9a7637f4e4e0688fd8b2b5c63133c91607682c-integrity/node_modules/@discordjs/collection/"),
      packageDependencies: new Map([
        ["@discordjs/collection", "0.1.6"],
      ]),
    }],
  ])],
  ["@discordjs/form-data", new Map([
    ["3.0.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-@discordjs-form-data-3.0.1-5c9e6be992e2e57d0dfa0e39979a850225fb4697-integrity/node_modules/@discordjs/form-data/"),
      packageDependencies: new Map([
        ["asynckit", "0.4.0"],
        ["combined-stream", "1.0.8"],
        ["mime-types", "2.1.31"],
        ["@discordjs/form-data", "3.0.1"],
      ]),
    }],
  ])],
  ["asynckit", new Map([
    ["0.4.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-asynckit-0.4.0-c79ed97f7f34cb8f2ba1bc9790bcc366474b4b79-integrity/node_modules/asynckit/"),
      packageDependencies: new Map([
        ["asynckit", "0.4.0"],
      ]),
    }],
  ])],
  ["combined-stream", new Map([
    ["1.0.8", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-combined-stream-1.0.8-c3d45a8b34fd730631a110a8a2520682b31d5a7f-integrity/node_modules/combined-stream/"),
      packageDependencies: new Map([
        ["delayed-stream", "1.0.0"],
        ["combined-stream", "1.0.8"],
      ]),
    }],
  ])],
  ["delayed-stream", new Map([
    ["1.0.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-delayed-stream-1.0.0-df3ae199acadfb7d440aaae0b29e2272b24ec619-integrity/node_modules/delayed-stream/"),
      packageDependencies: new Map([
        ["delayed-stream", "1.0.0"],
      ]),
    }],
  ])],
  ["mime-types", new Map([
    ["2.1.31", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-mime-types-2.1.31-a00d76b74317c61f9c2db2218b8e9f8e9c5c9e6b-integrity/node_modules/mime-types/"),
      packageDependencies: new Map([
        ["mime-db", "1.48.0"],
        ["mime-types", "2.1.31"],
      ]),
    }],
  ])],
  ["mime-db", new Map([
    ["1.48.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-mime-db-1.48.0-e35b31045dd7eada3aaad537ed88a33afbef2d1d-integrity/node_modules/mime-db/"),
      packageDependencies: new Map([
        ["mime-db", "1.48.0"],
      ]),
    }],
  ])],
  ["@sapphire/async-queue", new Map([
    ["1.1.4", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-@sapphire-async-queue-1.1.4-ae431310917a8880961cebe8e59df6ffa40f2957-integrity/node_modules/@sapphire/async-queue/"),
      packageDependencies: new Map([
        ["@sapphire/async-queue", "1.1.4"],
      ]),
    }],
  ])],
  ["@types/ws", new Map([
    ["7.4.7", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-@types-ws-7.4.7-f7c390a36f7a0679aa69de2d501319f4f8d9b702-integrity/node_modules/@types/ws/"),
      packageDependencies: new Map([
        ["@types/node", "16.4.2"],
        ["@types/ws", "7.4.7"],
      ]),
    }],
  ])],
  ["@types/node", new Map([
    ["16.4.2", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-@types-node-16.4.2-0a95d7fd950cb1eaca0ce11031d72e8f680b775a-integrity/node_modules/@types/node/"),
      packageDependencies: new Map([
        ["@types/node", "16.4.2"],
      ]),
    }],
  ])],
  ["abort-controller", new Map([
    ["3.0.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-abort-controller-3.0.0-eaf54d53b62bae4138e809ca225c8439a6efb392-integrity/node_modules/abort-controller/"),
      packageDependencies: new Map([
        ["event-target-shim", "5.0.1"],
        ["abort-controller", "3.0.0"],
      ]),
    }],
  ])],
  ["event-target-shim", new Map([
    ["5.0.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-event-target-shim-5.0.1-5d4d3ebdf9583d63a5333ce2deb7480ab2b05789-integrity/node_modules/event-target-shim/"),
      packageDependencies: new Map([
        ["event-target-shim", "5.0.1"],
      ]),
    }],
  ])],
  ["node-fetch", new Map([
    ["2.6.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-node-fetch-2.6.1-045bd323631f76ed2e2b55573394416b639a0052-integrity/node_modules/node-fetch/"),
      packageDependencies: new Map([
        ["node-fetch", "2.6.1"],
      ]),
    }],
  ])],
  ["ws", new Map([
    ["7.5.3", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-ws-7.5.3-160835b63c7d97bfab418fc1b8a9fced2ac01a74-integrity/node_modules/ws/"),
      packageDependencies: new Map([
        ["ws", "7.5.3"],
      ]),
    }],
  ])],
  ["monk", new Map([
    ["7.3.4", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-monk-7.3.4-50ccd7daebb4c16ace58d45b2c28c29112f8a85e-integrity/node_modules/monk/"),
      packageDependencies: new Map([
        ["@types/mongodb", "3.6.20"],
        ["debug", "4.3.2"],
        ["mongodb", "3.6.10"],
        ["monk-middleware-cast-ids", "0.2.1"],
        ["monk-middleware-fields", "0.2.0"],
        ["monk-middleware-handle-callback", "0.2.2"],
        ["monk-middleware-options", "0.2.1"],
        ["monk-middleware-query", "0.2.0"],
        ["monk-middleware-wait-for-connection", "0.2.0"],
        ["object-assign", "4.1.1"],
        ["monk", "7.3.4"],
      ]),
    }],
  ])],
  ["@types/mongodb", new Map([
    ["3.6.20", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-@types-mongodb-3.6.20-b7c5c580644f6364002b649af1c06c3c0454e1d2-integrity/node_modules/@types/mongodb/"),
      packageDependencies: new Map([
        ["@types/bson", "4.0.4"],
        ["@types/node", "16.4.2"],
        ["@types/mongodb", "3.6.20"],
      ]),
    }],
  ])],
  ["@types/bson", new Map([
    ["4.0.4", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-@types-bson-4.0.4-79d2d26e81070044db2a1a8b2cc2f673c840e1e5-integrity/node_modules/@types/bson/"),
      packageDependencies: new Map([
        ["@types/node", "16.4.2"],
        ["@types/bson", "4.0.4"],
      ]),
    }],
  ])],
  ["debug", new Map([
    ["4.3.2", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-debug-4.3.2-f0a49c18ac8779e31d4a0c6029dfb76873c7428b-integrity/node_modules/debug/"),
      packageDependencies: new Map([
        ["ms", "2.1.2"],
        ["debug", "4.3.2"],
      ]),
    }],
  ])],
  ["ms", new Map([
    ["2.1.2", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-ms-2.1.2-d09d1f357b443f493382a8eb3ccd183872ae6009-integrity/node_modules/ms/"),
      packageDependencies: new Map([
        ["ms", "2.1.2"],
      ]),
    }],
  ])],
  ["mongodb", new Map([
    ["3.6.10", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-mongodb-3.6.10-f10e990113c86b195c8af0599b9b3a90748b6ee4-integrity/node_modules/mongodb/"),
      packageDependencies: new Map([
        ["bl", "2.2.1"],
        ["bson", "1.1.6"],
        ["denque", "1.5.0"],
        ["optional-require", "1.1.0"],
        ["safe-buffer", "5.2.1"],
        ["saslprep", "1.0.3"],
        ["mongodb", "3.6.10"],
      ]),
    }],
  ])],
  ["bl", new Map([
    ["2.2.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-bl-2.2.1-8c11a7b730655c5d56898cdc871224f40fd901d5-integrity/node_modules/bl/"),
      packageDependencies: new Map([
        ["readable-stream", "2.3.7"],
        ["safe-buffer", "5.2.1"],
        ["bl", "2.2.1"],
      ]),
    }],
  ])],
  ["readable-stream", new Map([
    ["2.3.7", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-readable-stream-2.3.7-1eca1cf711aef814c04f62252a36a62f6cb23b57-integrity/node_modules/readable-stream/"),
      packageDependencies: new Map([
        ["core-util-is", "1.0.2"],
        ["inherits", "2.0.4"],
        ["isarray", "1.0.0"],
        ["process-nextick-args", "2.0.1"],
        ["safe-buffer", "5.1.2"],
        ["string_decoder", "1.1.1"],
        ["util-deprecate", "1.0.2"],
        ["readable-stream", "2.3.7"],
      ]),
    }],
  ])],
  ["core-util-is", new Map([
    ["1.0.2", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-core-util-is-1.0.2-b5fd54220aa2bc5ab57aab7140c940754503c1a7-integrity/node_modules/core-util-is/"),
      packageDependencies: new Map([
        ["core-util-is", "1.0.2"],
      ]),
    }],
  ])],
  ["inherits", new Map([
    ["2.0.4", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-inherits-2.0.4-0fa2c64f932917c3433a0ded55363aae37416b7c-integrity/node_modules/inherits/"),
      packageDependencies: new Map([
        ["inherits", "2.0.4"],
      ]),
    }],
  ])],
  ["isarray", new Map([
    ["1.0.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-isarray-1.0.0-bb935d48582cba168c06834957a54a3e07124f11-integrity/node_modules/isarray/"),
      packageDependencies: new Map([
        ["isarray", "1.0.0"],
      ]),
    }],
  ])],
  ["process-nextick-args", new Map([
    ["2.0.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-process-nextick-args-2.0.1-7820d9b16120cc55ca9ae7792680ae7dba6d7fe2-integrity/node_modules/process-nextick-args/"),
      packageDependencies: new Map([
        ["process-nextick-args", "2.0.1"],
      ]),
    }],
  ])],
  ["safe-buffer", new Map([
    ["5.1.2", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-safe-buffer-5.1.2-991ec69d296e0313747d59bdfd2b745c35f8828d-integrity/node_modules/safe-buffer/"),
      packageDependencies: new Map([
        ["safe-buffer", "5.1.2"],
      ]),
    }],
    ["5.2.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-safe-buffer-5.2.1-1eaf9fa9bdb1fdd4ec75f58f9cdb4e6b7827eec6-integrity/node_modules/safe-buffer/"),
      packageDependencies: new Map([
        ["safe-buffer", "5.2.1"],
      ]),
    }],
  ])],
  ["string_decoder", new Map([
    ["1.1.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-string-decoder-1.1.1-9cf1611ba62685d7030ae9e4ba34149c3af03fc8-integrity/node_modules/string_decoder/"),
      packageDependencies: new Map([
        ["safe-buffer", "5.1.2"],
        ["string_decoder", "1.1.1"],
      ]),
    }],
  ])],
  ["util-deprecate", new Map([
    ["1.0.2", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-util-deprecate-1.0.2-450d4dc9fa70de732762fbd2d4a28981419a0ccf-integrity/node_modules/util-deprecate/"),
      packageDependencies: new Map([
        ["util-deprecate", "1.0.2"],
      ]),
    }],
  ])],
  ["bson", new Map([
    ["1.1.6", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-bson-1.1.6-fb819be9a60cd677e0853aee4ca712a785d6618a-integrity/node_modules/bson/"),
      packageDependencies: new Map([
        ["bson", "1.1.6"],
      ]),
    }],
  ])],
  ["denque", new Map([
    ["1.5.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-denque-1.5.0-773de0686ff2d8ec2ff92914316a47b73b1c73de-integrity/node_modules/denque/"),
      packageDependencies: new Map([
        ["denque", "1.5.0"],
      ]),
    }],
  ])],
  ["optional-require", new Map([
    ["1.1.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-optional-require-1.1.0-01dfbafbbc2e8d79e33558f5af3917f22cc35c2c-integrity/node_modules/optional-require/"),
      packageDependencies: new Map([
        ["require-at", "1.0.6"],
        ["optional-require", "1.1.0"],
      ]),
    }],
  ])],
  ["require-at", new Map([
    ["1.0.6", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-require-at-1.0.6-9eb7e3c5e00727f5a4744070a7f560d4de4f6e6a-integrity/node_modules/require-at/"),
      packageDependencies: new Map([
        ["require-at", "1.0.6"],
      ]),
    }],
  ])],
  ["saslprep", new Map([
    ["1.0.3", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-saslprep-1.0.3-4c02f946b56cf54297e347ba1093e7acac4cf226-integrity/node_modules/saslprep/"),
      packageDependencies: new Map([
        ["sparse-bitfield", "3.0.3"],
        ["saslprep", "1.0.3"],
      ]),
    }],
  ])],
  ["sparse-bitfield", new Map([
    ["3.0.3", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-sparse-bitfield-3.0.3-ff4ae6e68656056ba4b3e792ab3334d38273ca11-integrity/node_modules/sparse-bitfield/"),
      packageDependencies: new Map([
        ["memory-pager", "1.5.0"],
        ["sparse-bitfield", "3.0.3"],
      ]),
    }],
  ])],
  ["memory-pager", new Map([
    ["1.5.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-memory-pager-1.5.0-d8751655d22d384682741c972f2c3d6dfa3e66b5-integrity/node_modules/memory-pager/"),
      packageDependencies: new Map([
        ["memory-pager", "1.5.0"],
      ]),
    }],
  ])],
  ["monk-middleware-cast-ids", new Map([
    ["0.2.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-monk-middleware-cast-ids-0.2.1-40c40e5a6cb33ccedc289220943275ee8861c529-integrity/node_modules/monk-middleware-cast-ids/"),
      packageDependencies: new Map([
        ["monk-middleware-cast-ids", "0.2.1"],
      ]),
    }],
  ])],
  ["monk-middleware-fields", new Map([
    ["0.2.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-monk-middleware-fields-0.2.0-ff637af35f5948879ccb2be15a91360911bea6c1-integrity/node_modules/monk-middleware-fields/"),
      packageDependencies: new Map([
        ["monk-middleware-fields", "0.2.0"],
      ]),
    }],
  ])],
  ["monk-middleware-handle-callback", new Map([
    ["0.2.2", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-monk-middleware-handle-callback-0.2.2-47de6cc1248726c72a2be0c81bc4e68310c32146-integrity/node_modules/monk-middleware-handle-callback/"),
      packageDependencies: new Map([
        ["monk-middleware-handle-callback", "0.2.2"],
      ]),
    }],
  ])],
  ["monk-middleware-options", new Map([
    ["0.2.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-monk-middleware-options-0.2.1-58dae1c518d46636ebdff506fadfc773bb442886-integrity/node_modules/monk-middleware-options/"),
      packageDependencies: new Map([
        ["monk-middleware-options", "0.2.1"],
      ]),
    }],
  ])],
  ["monk-middleware-query", new Map([
    ["0.2.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-monk-middleware-query-0.2.0-a926c677d4a5620c62151b0a56d0c0c151675874-integrity/node_modules/monk-middleware-query/"),
      packageDependencies: new Map([
        ["monk-middleware-query", "0.2.0"],
      ]),
    }],
  ])],
  ["monk-middleware-wait-for-connection", new Map([
    ["0.2.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-monk-middleware-wait-for-connection-0.2.0-312958d30e588b57d09754dd7c97b4843316835a-integrity/node_modules/monk-middleware-wait-for-connection/"),
      packageDependencies: new Map([
        ["monk-middleware-wait-for-connection", "0.2.0"],
      ]),
    }],
  ])],
  ["object-assign", new Map([
    ["4.1.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-object-assign-4.1.1-2109adc7965887cfc05cbbd442cac8bfbb360863-integrity/node_modules/object-assign/"),
      packageDependencies: new Map([
        ["object-assign", "4.1.1"],
      ]),
    }],
  ])],
  ["yup", new Map([
    ["0.32.9", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-yup-0.32.9-9367bec6b1b0e39211ecbca598702e106019d872-integrity/node_modules/yup/"),
      packageDependencies: new Map([
        ["@babel/runtime", "7.14.8"],
        ["@types/lodash", "4.14.171"],
        ["lodash", "4.17.21"],
        ["lodash-es", "4.17.21"],
        ["nanoclone", "0.2.1"],
        ["property-expr", "2.0.4"],
        ["toposort", "2.0.2"],
        ["yup", "0.32.9"],
      ]),
    }],
  ])],
  ["@babel/runtime", new Map([
    ["7.14.8", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-@babel-runtime-7.14.8-7119a56f421018852694290b9f9148097391b446-integrity/node_modules/@babel/runtime/"),
      packageDependencies: new Map([
        ["regenerator-runtime", "0.13.9"],
        ["@babel/runtime", "7.14.8"],
      ]),
    }],
  ])],
  ["regenerator-runtime", new Map([
    ["0.13.9", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-regenerator-runtime-0.13.9-8925742a98ffd90814988d7566ad30ca3b263b52-integrity/node_modules/regenerator-runtime/"),
      packageDependencies: new Map([
        ["regenerator-runtime", "0.13.9"],
      ]),
    }],
  ])],
  ["@types/lodash", new Map([
    ["4.14.171", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-@types-lodash-4.14.171-f01b3a5fe3499e34b622c362a46a609fdb23573b-integrity/node_modules/@types/lodash/"),
      packageDependencies: new Map([
        ["@types/lodash", "4.14.171"],
      ]),
    }],
  ])],
  ["lodash", new Map([
    ["4.17.21", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-lodash-4.17.21-679591c564c3bffaae8454cf0b3df370c3d6911c-integrity/node_modules/lodash/"),
      packageDependencies: new Map([
        ["lodash", "4.17.21"],
      ]),
    }],
  ])],
  ["lodash-es", new Map([
    ["4.17.21", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-lodash-es-4.17.21-43e626c46e6591b7750beb2b50117390c609e3ee-integrity/node_modules/lodash-es/"),
      packageDependencies: new Map([
        ["lodash-es", "4.17.21"],
      ]),
    }],
  ])],
  ["nanoclone", new Map([
    ["0.2.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-nanoclone-0.2.1-dd4090f8f1a110d26bb32c49ed2f5b9235209ed4-integrity/node_modules/nanoclone/"),
      packageDependencies: new Map([
        ["nanoclone", "0.2.1"],
      ]),
    }],
  ])],
  ["property-expr", new Map([
    ["2.0.4", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-property-expr-2.0.4-37b925478e58965031bb612ec5b3260f8241e910-integrity/node_modules/property-expr/"),
      packageDependencies: new Map([
        ["property-expr", "2.0.4"],
      ]),
    }],
  ])],
  ["toposort", new Map([
    ["2.0.2", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-toposort-2.0.2-ae21768175d1559d48bef35420b2f4962f09c330-integrity/node_modules/toposort/"),
      packageDependencies: new Map([
        ["toposort", "2.0.2"],
      ]),
    }],
  ])],
  ["@types/prettier", new Map([
    ["2.3.2", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-@types-prettier-2.3.2-fc8c2825e4ed2142473b4a81064e6e081463d1b3-integrity/node_modules/@types/prettier/"),
      packageDependencies: new Map([
        ["@types/prettier", "2.3.2"],
      ]),
    }],
  ])],
  ["@typescript-eslint/eslint-plugin", new Map([
    ["4.28.4", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-@typescript-eslint-eslint-plugin-4.28.4-e73c8cabbf3f08dee0e1bda65ed4e622ae8f8921-integrity/node_modules/@typescript-eslint/eslint-plugin/"),
      packageDependencies: new Map([
        ["@typescript-eslint/parser", "4.28.4"],
        ["eslint", "7.31.0"],
        ["@typescript-eslint/experimental-utils", "4.28.4"],
        ["@typescript-eslint/scope-manager", "4.28.4"],
        ["debug", "4.3.2"],
        ["functional-red-black-tree", "1.0.1"],
        ["regexpp", "3.2.0"],
        ["semver", "7.3.5"],
        ["tsutils", "pnp:76e173d2a9278dcfef5ba56f0e96a09a5e3e4d49"],
        ["@typescript-eslint/eslint-plugin", "4.28.4"],
      ]),
    }],
  ])],
  ["@typescript-eslint/experimental-utils", new Map([
    ["4.28.4", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-@typescript-eslint-experimental-utils-4.28.4-9c70c35ebed087a5c70fb0ecd90979547b7fec96-integrity/node_modules/@typescript-eslint/experimental-utils/"),
      packageDependencies: new Map([
        ["eslint", "7.31.0"],
        ["@types/json-schema", "7.0.8"],
        ["@typescript-eslint/scope-manager", "4.28.4"],
        ["@typescript-eslint/types", "4.28.4"],
        ["@typescript-eslint/typescript-estree", "4.28.4"],
        ["eslint-scope", "5.1.1"],
        ["eslint-utils", "3.0.0"],
        ["@typescript-eslint/experimental-utils", "4.28.4"],
      ]),
    }],
  ])],
  ["@types/json-schema", new Map([
    ["7.0.8", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-@types-json-schema-7.0.8-edf1bf1dbf4e04413ca8e5b17b3b7d7d54b59818-integrity/node_modules/@types/json-schema/"),
      packageDependencies: new Map([
        ["@types/json-schema", "7.0.8"],
      ]),
    }],
  ])],
  ["@typescript-eslint/scope-manager", new Map([
    ["4.28.4", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-@typescript-eslint-scope-manager-4.28.4-bdbce9b6a644e34f767bd68bc17bb14353b9fe7f-integrity/node_modules/@typescript-eslint/scope-manager/"),
      packageDependencies: new Map([
        ["@typescript-eslint/types", "4.28.4"],
        ["@typescript-eslint/visitor-keys", "4.28.4"],
        ["@typescript-eslint/scope-manager", "4.28.4"],
      ]),
    }],
  ])],
  ["@typescript-eslint/types", new Map([
    ["4.28.4", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-@typescript-eslint-types-4.28.4-41acbd79b5816b7c0dd7530a43d97d020d3aeb42-integrity/node_modules/@typescript-eslint/types/"),
      packageDependencies: new Map([
        ["@typescript-eslint/types", "4.28.4"],
      ]),
    }],
  ])],
  ["@typescript-eslint/visitor-keys", new Map([
    ["4.28.4", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-@typescript-eslint-visitor-keys-4.28.4-92dacfefccd6751cbb0a964f06683bfd72d0c4d3-integrity/node_modules/@typescript-eslint/visitor-keys/"),
      packageDependencies: new Map([
        ["@typescript-eslint/types", "4.28.4"],
        ["eslint-visitor-keys", "2.1.0"],
        ["@typescript-eslint/visitor-keys", "4.28.4"],
      ]),
    }],
  ])],
  ["eslint-visitor-keys", new Map([
    ["2.1.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-eslint-visitor-keys-2.1.0-f65328259305927392c938ed44eb0a5c9b2bd303-integrity/node_modules/eslint-visitor-keys/"),
      packageDependencies: new Map([
        ["eslint-visitor-keys", "2.1.0"],
      ]),
    }],
    ["1.3.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-eslint-visitor-keys-1.3.0-30ebd1ef7c2fdff01c3a4f151044af25fab0523e-integrity/node_modules/eslint-visitor-keys/"),
      packageDependencies: new Map([
        ["eslint-visitor-keys", "1.3.0"],
      ]),
    }],
  ])],
  ["@typescript-eslint/typescript-estree", new Map([
    ["4.28.4", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-@typescript-eslint-typescript-estree-4.28.4-252e6863278dc0727244be9e371eb35241c46d00-integrity/node_modules/@typescript-eslint/typescript-estree/"),
      packageDependencies: new Map([
        ["@typescript-eslint/types", "4.28.4"],
        ["@typescript-eslint/visitor-keys", "4.28.4"],
        ["debug", "4.3.2"],
        ["globby", "11.0.4"],
        ["is-glob", "4.0.1"],
        ["semver", "7.3.5"],
        ["tsutils", "pnp:6485638f2e2eb43d324f143714fd5e85d715493a"],
        ["@typescript-eslint/typescript-estree", "4.28.4"],
      ]),
    }],
  ])],
  ["globby", new Map([
    ["11.0.4", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-globby-11.0.4-2cbaff77c2f2a62e71e9b2813a67b97a3a3001a5-integrity/node_modules/globby/"),
      packageDependencies: new Map([
        ["array-union", "2.1.0"],
        ["dir-glob", "3.0.1"],
        ["fast-glob", "3.2.7"],
        ["ignore", "5.1.8"],
        ["merge2", "1.4.1"],
        ["slash", "3.0.0"],
        ["globby", "11.0.4"],
      ]),
    }],
  ])],
  ["array-union", new Map([
    ["2.1.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-array-union-2.1.0-b798420adbeb1de828d84acd8a2e23d3efe85e8d-integrity/node_modules/array-union/"),
      packageDependencies: new Map([
        ["array-union", "2.1.0"],
      ]),
    }],
  ])],
  ["dir-glob", new Map([
    ["3.0.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-dir-glob-3.0.1-56dbf73d992a4a93ba1584f4534063fd2e41717f-integrity/node_modules/dir-glob/"),
      packageDependencies: new Map([
        ["path-type", "4.0.0"],
        ["dir-glob", "3.0.1"],
      ]),
    }],
  ])],
  ["path-type", new Map([
    ["4.0.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-path-type-4.0.0-84ed01c0a7ba380afe09d90a8c180dcd9d03043b-integrity/node_modules/path-type/"),
      packageDependencies: new Map([
        ["path-type", "4.0.0"],
      ]),
    }],
  ])],
  ["fast-glob", new Map([
    ["3.2.7", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-fast-glob-3.2.7-fd6cb7a2d7e9aa7a7846111e85a196d6b2f766a1-integrity/node_modules/fast-glob/"),
      packageDependencies: new Map([
        ["@nodelib/fs.stat", "2.0.5"],
        ["@nodelib/fs.walk", "1.2.8"],
        ["glob-parent", "5.1.2"],
        ["merge2", "1.4.1"],
        ["micromatch", "4.0.4"],
        ["fast-glob", "3.2.7"],
      ]),
    }],
  ])],
  ["@nodelib/fs.stat", new Map([
    ["2.0.5", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-@nodelib-fs-stat-2.0.5-5bd262af94e9d25bd1e71b05deed44876a222e8b-integrity/node_modules/@nodelib/fs.stat/"),
      packageDependencies: new Map([
        ["@nodelib/fs.stat", "2.0.5"],
      ]),
    }],
  ])],
  ["@nodelib/fs.walk", new Map([
    ["1.2.8", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-@nodelib-fs-walk-1.2.8-e95737e8bb6746ddedf69c556953494f196fe69a-integrity/node_modules/@nodelib/fs.walk/"),
      packageDependencies: new Map([
        ["@nodelib/fs.scandir", "2.1.5"],
        ["fastq", "1.11.1"],
        ["@nodelib/fs.walk", "1.2.8"],
      ]),
    }],
  ])],
  ["@nodelib/fs.scandir", new Map([
    ["2.1.5", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-@nodelib-fs-scandir-2.1.5-7619c2eb21b25483f6d167548b4cfd5a7488c3d5-integrity/node_modules/@nodelib/fs.scandir/"),
      packageDependencies: new Map([
        ["@nodelib/fs.stat", "2.0.5"],
        ["run-parallel", "1.2.0"],
        ["@nodelib/fs.scandir", "2.1.5"],
      ]),
    }],
  ])],
  ["run-parallel", new Map([
    ["1.2.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-run-parallel-1.2.0-66d1368da7bdf921eb9d95bd1a9229e7f21a43ee-integrity/node_modules/run-parallel/"),
      packageDependencies: new Map([
        ["queue-microtask", "1.2.3"],
        ["run-parallel", "1.2.0"],
      ]),
    }],
  ])],
  ["queue-microtask", new Map([
    ["1.2.3", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-queue-microtask-1.2.3-4929228bbc724dfac43e0efb058caf7b6cfb6243-integrity/node_modules/queue-microtask/"),
      packageDependencies: new Map([
        ["queue-microtask", "1.2.3"],
      ]),
    }],
  ])],
  ["fastq", new Map([
    ["1.11.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-fastq-1.11.1-5d8175aae17db61947f8b162cfc7f63264d22807-integrity/node_modules/fastq/"),
      packageDependencies: new Map([
        ["reusify", "1.0.4"],
        ["fastq", "1.11.1"],
      ]),
    }],
  ])],
  ["reusify", new Map([
    ["1.0.4", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-reusify-1.0.4-90da382b1e126efc02146e90845a88db12925d76-integrity/node_modules/reusify/"),
      packageDependencies: new Map([
        ["reusify", "1.0.4"],
      ]),
    }],
  ])],
  ["glob-parent", new Map([
    ["5.1.2", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-glob-parent-5.1.2-869832c58034fe68a4093c17dc15e8340d8401c4-integrity/node_modules/glob-parent/"),
      packageDependencies: new Map([
        ["is-glob", "4.0.1"],
        ["glob-parent", "5.1.2"],
      ]),
    }],
  ])],
  ["is-glob", new Map([
    ["4.0.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-is-glob-4.0.1-7567dbe9f2f5e2467bc77ab83c4a29482407a5dc-integrity/node_modules/is-glob/"),
      packageDependencies: new Map([
        ["is-extglob", "2.1.1"],
        ["is-glob", "4.0.1"],
      ]),
    }],
  ])],
  ["is-extglob", new Map([
    ["2.1.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-is-extglob-2.1.1-a88c02535791f02ed37c76a1b9ea9773c833f8c2-integrity/node_modules/is-extglob/"),
      packageDependencies: new Map([
        ["is-extglob", "2.1.1"],
      ]),
    }],
  ])],
  ["merge2", new Map([
    ["1.4.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-merge2-1.4.1-4368892f885e907455a6fd7dc55c0c9d404990ae-integrity/node_modules/merge2/"),
      packageDependencies: new Map([
        ["merge2", "1.4.1"],
      ]),
    }],
  ])],
  ["micromatch", new Map([
    ["4.0.4", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-micromatch-4.0.4-896d519dfe9db25fce94ceb7a500919bf881ebf9-integrity/node_modules/micromatch/"),
      packageDependencies: new Map([
        ["braces", "3.0.2"],
        ["picomatch", "2.3.0"],
        ["micromatch", "4.0.4"],
      ]),
    }],
  ])],
  ["braces", new Map([
    ["3.0.2", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-braces-3.0.2-3454e1a462ee8d599e236df336cd9ea4f8afe107-integrity/node_modules/braces/"),
      packageDependencies: new Map([
        ["fill-range", "7.0.1"],
        ["braces", "3.0.2"],
      ]),
    }],
  ])],
  ["fill-range", new Map([
    ["7.0.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-fill-range-7.0.1-1919a6a7c75fe38b2c7c77e5198535da9acdda40-integrity/node_modules/fill-range/"),
      packageDependencies: new Map([
        ["to-regex-range", "5.0.1"],
        ["fill-range", "7.0.1"],
      ]),
    }],
  ])],
  ["to-regex-range", new Map([
    ["5.0.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-to-regex-range-5.0.1-1648c44aae7c8d988a326018ed72f5b4dd0392e4-integrity/node_modules/to-regex-range/"),
      packageDependencies: new Map([
        ["is-number", "7.0.0"],
        ["to-regex-range", "5.0.1"],
      ]),
    }],
  ])],
  ["is-number", new Map([
    ["7.0.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-is-number-7.0.0-7535345b896734d5f80c4d06c50955527a14f12b-integrity/node_modules/is-number/"),
      packageDependencies: new Map([
        ["is-number", "7.0.0"],
      ]),
    }],
  ])],
  ["picomatch", new Map([
    ["2.3.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-picomatch-2.3.0-f1f061de8f6a4bf022892e2d128234fb98302972-integrity/node_modules/picomatch/"),
      packageDependencies: new Map([
        ["picomatch", "2.3.0"],
      ]),
    }],
  ])],
  ["ignore", new Map([
    ["5.1.8", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-ignore-5.1.8-f150a8b50a34289b33e22f5889abd4d8016f0e57-integrity/node_modules/ignore/"),
      packageDependencies: new Map([
        ["ignore", "5.1.8"],
      ]),
    }],
    ["4.0.6", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-ignore-4.0.6-750e3db5862087b4737ebac8207ffd1ef27b25fc-integrity/node_modules/ignore/"),
      packageDependencies: new Map([
        ["ignore", "4.0.6"],
      ]),
    }],
  ])],
  ["slash", new Map([
    ["3.0.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-slash-3.0.0-6539be870c165adbd5240220dbe361f1bc4d4634-integrity/node_modules/slash/"),
      packageDependencies: new Map([
        ["slash", "3.0.0"],
      ]),
    }],
  ])],
  ["semver", new Map([
    ["7.3.5", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-semver-7.3.5-0b621c879348d8998e4b0e4be94b3f12e6018ef7-integrity/node_modules/semver/"),
      packageDependencies: new Map([
        ["lru-cache", "6.0.0"],
        ["semver", "7.3.5"],
      ]),
    }],
  ])],
  ["lru-cache", new Map([
    ["6.0.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-lru-cache-6.0.0-6d6fe6570ebd96aaf90fcad1dafa3b2566db3a94-integrity/node_modules/lru-cache/"),
      packageDependencies: new Map([
        ["yallist", "4.0.0"],
        ["lru-cache", "6.0.0"],
      ]),
    }],
  ])],
  ["yallist", new Map([
    ["4.0.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-yallist-4.0.0-9bb92790d9c0effec63be73519e11a35019a3a72-integrity/node_modules/yallist/"),
      packageDependencies: new Map([
        ["yallist", "4.0.0"],
      ]),
    }],
  ])],
  ["tsutils", new Map([
    ["pnp:6485638f2e2eb43d324f143714fd5e85d715493a", {
      packageLocation: path.resolve(__dirname, "./.pnp/externals/pnp-6485638f2e2eb43d324f143714fd5e85d715493a/node_modules/tsutils/"),
      packageDependencies: new Map([
        ["tslib", "1.14.1"],
        ["tsutils", "pnp:6485638f2e2eb43d324f143714fd5e85d715493a"],
      ]),
    }],
    ["pnp:76e173d2a9278dcfef5ba56f0e96a09a5e3e4d49", {
      packageLocation: path.resolve(__dirname, "./.pnp/externals/pnp-76e173d2a9278dcfef5ba56f0e96a09a5e3e4d49/node_modules/tsutils/"),
      packageDependencies: new Map([
        ["tslib", "1.14.1"],
        ["tsutils", "pnp:76e173d2a9278dcfef5ba56f0e96a09a5e3e4d49"],
      ]),
    }],
  ])],
  ["eslint-scope", new Map([
    ["5.1.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-eslint-scope-5.1.1-e786e59a66cb92b3f6c1fb0d508aab174848f48c-integrity/node_modules/eslint-scope/"),
      packageDependencies: new Map([
        ["esrecurse", "4.3.0"],
        ["estraverse", "4.3.0"],
        ["eslint-scope", "5.1.1"],
      ]),
    }],
  ])],
  ["esrecurse", new Map([
    ["4.3.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-esrecurse-4.3.0-7ad7964d679abb28bee72cec63758b1c5d2c9921-integrity/node_modules/esrecurse/"),
      packageDependencies: new Map([
        ["estraverse", "5.2.0"],
        ["esrecurse", "4.3.0"],
      ]),
    }],
  ])],
  ["estraverse", new Map([
    ["5.2.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-estraverse-5.2.0-307df42547e6cc7324d3cf03c155d5cdb8c53880-integrity/node_modules/estraverse/"),
      packageDependencies: new Map([
        ["estraverse", "5.2.0"],
      ]),
    }],
    ["4.3.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-estraverse-4.3.0-398ad3f3c5a24948be7725e83d11a7de28cdbd1d-integrity/node_modules/estraverse/"),
      packageDependencies: new Map([
        ["estraverse", "4.3.0"],
      ]),
    }],
  ])],
  ["eslint-utils", new Map([
    ["3.0.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-eslint-utils-3.0.0-8aebaface7345bb33559db0a1f13a1d2d48c3672-integrity/node_modules/eslint-utils/"),
      packageDependencies: new Map([
        ["eslint", "7.31.0"],
        ["eslint-visitor-keys", "2.1.0"],
        ["eslint-utils", "3.0.0"],
      ]),
    }],
    ["2.1.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-eslint-utils-2.1.0-d2de5e03424e707dc10c74068ddedae708741b27-integrity/node_modules/eslint-utils/"),
      packageDependencies: new Map([
        ["eslint-visitor-keys", "1.3.0"],
        ["eslint-utils", "2.1.0"],
      ]),
    }],
  ])],
  ["functional-red-black-tree", new Map([
    ["1.0.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-functional-red-black-tree-1.0.1-1b0ab3bd553b2a0d6399d29c0e3ea0b252078327-integrity/node_modules/functional-red-black-tree/"),
      packageDependencies: new Map([
        ["functional-red-black-tree", "1.0.1"],
      ]),
    }],
  ])],
  ["regexpp", new Map([
    ["3.2.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-regexpp-3.2.0-0425a2768d8f23bad70ca4b90461fa2f1213e1b2-integrity/node_modules/regexpp/"),
      packageDependencies: new Map([
        ["regexpp", "3.2.0"],
      ]),
    }],
  ])],
  ["@typescript-eslint/parser", new Map([
    ["4.28.4", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-@typescript-eslint-parser-4.28.4-bc462dc2779afeefdcf49082516afdc3e7b96fab-integrity/node_modules/@typescript-eslint/parser/"),
      packageDependencies: new Map([
        ["eslint", "7.31.0"],
        ["@typescript-eslint/scope-manager", "4.28.4"],
        ["@typescript-eslint/types", "4.28.4"],
        ["@typescript-eslint/typescript-estree", "4.28.4"],
        ["debug", "4.3.2"],
        ["@typescript-eslint/parser", "4.28.4"],
      ]),
    }],
  ])],
  ["eslint", new Map([
    ["7.31.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-eslint-7.31.0-f972b539424bf2604907a970860732c5d99d3aca-integrity/node_modules/eslint/"),
      packageDependencies: new Map([
        ["@babel/code-frame", "7.12.11"],
        ["@eslint/eslintrc", "0.4.3"],
        ["@humanwhocodes/config-array", "0.5.0"],
        ["ajv", "6.12.6"],
        ["chalk", "4.1.1"],
        ["cross-spawn", "7.0.3"],
        ["debug", "4.3.2"],
        ["doctrine", "3.0.0"],
        ["enquirer", "2.3.6"],
        ["escape-string-regexp", "4.0.0"],
        ["eslint-scope", "5.1.1"],
        ["eslint-utils", "2.1.0"],
        ["eslint-visitor-keys", "2.1.0"],
        ["espree", "7.3.1"],
        ["esquery", "1.4.0"],
        ["esutils", "2.0.3"],
        ["fast-deep-equal", "3.1.3"],
        ["file-entry-cache", "6.0.1"],
        ["functional-red-black-tree", "1.0.1"],
        ["glob-parent", "5.1.2"],
        ["globals", "13.10.0"],
        ["ignore", "4.0.6"],
        ["import-fresh", "3.3.0"],
        ["imurmurhash", "0.1.4"],
        ["is-glob", "4.0.1"],
        ["js-yaml", "3.14.1"],
        ["json-stable-stringify-without-jsonify", "1.0.1"],
        ["levn", "0.4.1"],
        ["lodash.merge", "4.6.2"],
        ["minimatch", "3.0.4"],
        ["natural-compare", "1.4.0"],
        ["optionator", "0.9.1"],
        ["progress", "2.0.3"],
        ["regexpp", "3.2.0"],
        ["semver", "7.3.5"],
        ["strip-ansi", "6.0.0"],
        ["strip-json-comments", "3.1.1"],
        ["table", "6.7.1"],
        ["text-table", "0.2.0"],
        ["v8-compile-cache", "2.3.0"],
        ["eslint", "7.31.0"],
      ]),
    }],
  ])],
  ["@babel/code-frame", new Map([
    ["7.12.11", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-@babel-code-frame-7.12.11-f4ad435aa263db935b8f10f2c552d23fb716a63f-integrity/node_modules/@babel/code-frame/"),
      packageDependencies: new Map([
        ["@babel/highlight", "7.14.5"],
        ["@babel/code-frame", "7.12.11"],
      ]),
    }],
  ])],
  ["@babel/highlight", new Map([
    ["7.14.5", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-@babel-highlight-7.14.5-6861a52f03966405001f6aa534a01a24d99e8cd9-integrity/node_modules/@babel/highlight/"),
      packageDependencies: new Map([
        ["@babel/helper-validator-identifier", "7.14.8"],
        ["chalk", "2.4.2"],
        ["js-tokens", "4.0.0"],
        ["@babel/highlight", "7.14.5"],
      ]),
    }],
  ])],
  ["@babel/helper-validator-identifier", new Map([
    ["7.14.8", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-@babel-helper-validator-identifier-7.14.8-32be33a756f29e278a0d644fa08a2c9e0f88a34c-integrity/node_modules/@babel/helper-validator-identifier/"),
      packageDependencies: new Map([
        ["@babel/helper-validator-identifier", "7.14.8"],
      ]),
    }],
  ])],
  ["chalk", new Map([
    ["2.4.2", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-chalk-2.4.2-cd42541677a54333cf541a49108c1432b44c9424-integrity/node_modules/chalk/"),
      packageDependencies: new Map([
        ["ansi-styles", "3.2.1"],
        ["escape-string-regexp", "1.0.5"],
        ["supports-color", "5.5.0"],
        ["chalk", "2.4.2"],
      ]),
    }],
    ["4.1.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-chalk-4.1.1-c80b3fab28bf6371e6863325eee67e618b77e6ad-integrity/node_modules/chalk/"),
      packageDependencies: new Map([
        ["ansi-styles", "4.3.0"],
        ["supports-color", "7.2.0"],
        ["chalk", "4.1.1"],
      ]),
    }],
  ])],
  ["ansi-styles", new Map([
    ["3.2.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-ansi-styles-3.2.1-41fbb20243e50b12be0f04b8dedbf07520ce841d-integrity/node_modules/ansi-styles/"),
      packageDependencies: new Map([
        ["color-convert", "1.9.3"],
        ["ansi-styles", "3.2.1"],
      ]),
    }],
    ["4.3.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-ansi-styles-4.3.0-edd803628ae71c04c85ae7a0906edad34b648937-integrity/node_modules/ansi-styles/"),
      packageDependencies: new Map([
        ["color-convert", "2.0.1"],
        ["ansi-styles", "4.3.0"],
      ]),
    }],
  ])],
  ["color-convert", new Map([
    ["1.9.3", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-color-convert-1.9.3-bb71850690e1f136567de629d2d5471deda4c1e8-integrity/node_modules/color-convert/"),
      packageDependencies: new Map([
        ["color-name", "1.1.3"],
        ["color-convert", "1.9.3"],
      ]),
    }],
    ["2.0.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-color-convert-2.0.1-72d3a68d598c9bdb3af2ad1e84f21d896abd4de3-integrity/node_modules/color-convert/"),
      packageDependencies: new Map([
        ["color-name", "1.1.4"],
        ["color-convert", "2.0.1"],
      ]),
    }],
  ])],
  ["color-name", new Map([
    ["1.1.3", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-color-name-1.1.3-a7d0558bd89c42f795dd42328f740831ca53bc25-integrity/node_modules/color-name/"),
      packageDependencies: new Map([
        ["color-name", "1.1.3"],
      ]),
    }],
    ["1.1.4", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-color-name-1.1.4-c2a09a87acbde69543de6f63fa3995c826c536a2-integrity/node_modules/color-name/"),
      packageDependencies: new Map([
        ["color-name", "1.1.4"],
      ]),
    }],
  ])],
  ["escape-string-regexp", new Map([
    ["1.0.5", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-escape-string-regexp-1.0.5-1b61c0562190a8dff6ae3bb2cf0200ca130b86d4-integrity/node_modules/escape-string-regexp/"),
      packageDependencies: new Map([
        ["escape-string-regexp", "1.0.5"],
      ]),
    }],
    ["4.0.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-escape-string-regexp-4.0.0-14ba83a5d373e3d311e5afca29cf5bfad965bf34-integrity/node_modules/escape-string-regexp/"),
      packageDependencies: new Map([
        ["escape-string-regexp", "4.0.0"],
      ]),
    }],
  ])],
  ["supports-color", new Map([
    ["5.5.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-supports-color-5.5.0-e2e69a44ac8772f78a1ec0b35b689df6530efc8f-integrity/node_modules/supports-color/"),
      packageDependencies: new Map([
        ["has-flag", "3.0.0"],
        ["supports-color", "5.5.0"],
      ]),
    }],
    ["7.2.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-supports-color-7.2.0-1b7dcdcb32b8138801b3e478ba6a51caa89648da-integrity/node_modules/supports-color/"),
      packageDependencies: new Map([
        ["has-flag", "4.0.0"],
        ["supports-color", "7.2.0"],
      ]),
    }],
  ])],
  ["has-flag", new Map([
    ["3.0.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-has-flag-3.0.0-b5d454dc2199ae225699f3467e5a07f3b955bafd-integrity/node_modules/has-flag/"),
      packageDependencies: new Map([
        ["has-flag", "3.0.0"],
      ]),
    }],
    ["4.0.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-has-flag-4.0.0-944771fd9c81c81265c4d6941860da06bb59479b-integrity/node_modules/has-flag/"),
      packageDependencies: new Map([
        ["has-flag", "4.0.0"],
      ]),
    }],
  ])],
  ["js-tokens", new Map([
    ["4.0.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-js-tokens-4.0.0-19203fb59991df98e3a287050d4647cdeaf32499-integrity/node_modules/js-tokens/"),
      packageDependencies: new Map([
        ["js-tokens", "4.0.0"],
      ]),
    }],
  ])],
  ["@eslint/eslintrc", new Map([
    ["0.4.3", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-@eslint-eslintrc-0.4.3-9e42981ef035beb3dd49add17acb96e8ff6f394c-integrity/node_modules/@eslint/eslintrc/"),
      packageDependencies: new Map([
        ["ajv", "6.12.6"],
        ["debug", "4.3.2"],
        ["espree", "7.3.1"],
        ["globals", "13.10.0"],
        ["ignore", "4.0.6"],
        ["import-fresh", "3.3.0"],
        ["js-yaml", "3.14.1"],
        ["minimatch", "3.0.4"],
        ["strip-json-comments", "3.1.1"],
        ["@eslint/eslintrc", "0.4.3"],
      ]),
    }],
  ])],
  ["ajv", new Map([
    ["6.12.6", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-ajv-6.12.6-baf5a62e802b07d977034586f8c3baf5adf26df4-integrity/node_modules/ajv/"),
      packageDependencies: new Map([
        ["fast-deep-equal", "3.1.3"],
        ["fast-json-stable-stringify", "2.1.0"],
        ["json-schema-traverse", "0.4.1"],
        ["uri-js", "4.4.1"],
        ["ajv", "6.12.6"],
      ]),
    }],
    ["8.6.2", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-ajv-8.6.2-2fb45e0e5fcbc0813326c1c3da535d1881bb0571-integrity/node_modules/ajv/"),
      packageDependencies: new Map([
        ["fast-deep-equal", "3.1.3"],
        ["json-schema-traverse", "1.0.0"],
        ["require-from-string", "2.0.2"],
        ["uri-js", "4.4.1"],
        ["ajv", "8.6.2"],
      ]),
    }],
  ])],
  ["fast-deep-equal", new Map([
    ["3.1.3", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-fast-deep-equal-3.1.3-3a7d56b559d6cbc3eb512325244e619a65c6c525-integrity/node_modules/fast-deep-equal/"),
      packageDependencies: new Map([
        ["fast-deep-equal", "3.1.3"],
      ]),
    }],
  ])],
  ["fast-json-stable-stringify", new Map([
    ["2.1.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-fast-json-stable-stringify-2.1.0-874bf69c6f404c2b5d99c481341399fd55892633-integrity/node_modules/fast-json-stable-stringify/"),
      packageDependencies: new Map([
        ["fast-json-stable-stringify", "2.1.0"],
      ]),
    }],
  ])],
  ["json-schema-traverse", new Map([
    ["0.4.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-json-schema-traverse-0.4.1-69f6a87d9513ab8bb8fe63bdb0979c448e684660-integrity/node_modules/json-schema-traverse/"),
      packageDependencies: new Map([
        ["json-schema-traverse", "0.4.1"],
      ]),
    }],
    ["1.0.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-json-schema-traverse-1.0.0-ae7bcb3656ab77a73ba5c49bf654f38e6b6860e2-integrity/node_modules/json-schema-traverse/"),
      packageDependencies: new Map([
        ["json-schema-traverse", "1.0.0"],
      ]),
    }],
  ])],
  ["uri-js", new Map([
    ["4.4.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-uri-js-4.4.1-9b1a52595225859e55f669d928f88c6c57f2a77e-integrity/node_modules/uri-js/"),
      packageDependencies: new Map([
        ["punycode", "2.1.1"],
        ["uri-js", "4.4.1"],
      ]),
    }],
  ])],
  ["punycode", new Map([
    ["2.1.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-punycode-2.1.1-b58b010ac40c22c5657616c8d2c2c02c7bf479ec-integrity/node_modules/punycode/"),
      packageDependencies: new Map([
        ["punycode", "2.1.1"],
      ]),
    }],
  ])],
  ["espree", new Map([
    ["7.3.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-espree-7.3.1-f2df330b752c6f55019f8bd89b7660039c1bbbb6-integrity/node_modules/espree/"),
      packageDependencies: new Map([
        ["acorn", "7.4.1"],
        ["acorn-jsx", "5.3.2"],
        ["eslint-visitor-keys", "1.3.0"],
        ["espree", "7.3.1"],
      ]),
    }],
  ])],
  ["acorn", new Map([
    ["7.4.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-acorn-7.4.1-feaed255973d2e77555b83dbc08851a6c63520fa-integrity/node_modules/acorn/"),
      packageDependencies: new Map([
        ["acorn", "7.4.1"],
      ]),
    }],
  ])],
  ["acorn-jsx", new Map([
    ["5.3.2", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-acorn-jsx-5.3.2-7ed5bb55908b3b2f1bc55c6af1653bada7f07937-integrity/node_modules/acorn-jsx/"),
      packageDependencies: new Map([
        ["acorn", "7.4.1"],
        ["acorn-jsx", "5.3.2"],
      ]),
    }],
  ])],
  ["globals", new Map([
    ["13.10.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-globals-13.10.0-60ba56c3ac2ca845cfbf4faeca727ad9dd204676-integrity/node_modules/globals/"),
      packageDependencies: new Map([
        ["type-fest", "0.20.2"],
        ["globals", "13.10.0"],
      ]),
    }],
  ])],
  ["type-fest", new Map([
    ["0.20.2", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-type-fest-0.20.2-1bf207f4b28f91583666cb5fbd327887301cd5f4-integrity/node_modules/type-fest/"),
      packageDependencies: new Map([
        ["type-fest", "0.20.2"],
      ]),
    }],
  ])],
  ["import-fresh", new Map([
    ["3.3.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-import-fresh-3.3.0-37162c25fcb9ebaa2e6e53d5b4d88ce17d9e0c2b-integrity/node_modules/import-fresh/"),
      packageDependencies: new Map([
        ["parent-module", "1.0.1"],
        ["resolve-from", "4.0.0"],
        ["import-fresh", "3.3.0"],
      ]),
    }],
  ])],
  ["parent-module", new Map([
    ["1.0.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-parent-module-1.0.1-691d2709e78c79fae3a156622452d00762caaaa2-integrity/node_modules/parent-module/"),
      packageDependencies: new Map([
        ["callsites", "3.1.0"],
        ["parent-module", "1.0.1"],
      ]),
    }],
  ])],
  ["callsites", new Map([
    ["3.1.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-callsites-3.1.0-b3630abd8943432f54b3f0519238e33cd7df2f73-integrity/node_modules/callsites/"),
      packageDependencies: new Map([
        ["callsites", "3.1.0"],
      ]),
    }],
  ])],
  ["resolve-from", new Map([
    ["4.0.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-resolve-from-4.0.0-4abcd852ad32dd7baabfe9b40e00a36db5f392e6-integrity/node_modules/resolve-from/"),
      packageDependencies: new Map([
        ["resolve-from", "4.0.0"],
      ]),
    }],
  ])],
  ["js-yaml", new Map([
    ["3.14.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-js-yaml-3.14.1-dae812fdb3825fa306609a8717383c50c36a0537-integrity/node_modules/js-yaml/"),
      packageDependencies: new Map([
        ["argparse", "1.0.10"],
        ["esprima", "4.0.1"],
        ["js-yaml", "3.14.1"],
      ]),
    }],
  ])],
  ["argparse", new Map([
    ["1.0.10", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-argparse-1.0.10-bcd6791ea5ae09725e17e5ad988134cd40b3d911-integrity/node_modules/argparse/"),
      packageDependencies: new Map([
        ["sprintf-js", "1.0.3"],
        ["argparse", "1.0.10"],
      ]),
    }],
  ])],
  ["sprintf-js", new Map([
    ["1.0.3", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-sprintf-js-1.0.3-04e6926f662895354f3dd015203633b857297e2c-integrity/node_modules/sprintf-js/"),
      packageDependencies: new Map([
        ["sprintf-js", "1.0.3"],
      ]),
    }],
  ])],
  ["esprima", new Map([
    ["4.0.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-esprima-4.0.1-13b04cdb3e6c5d19df91ab6987a8695619b0aa71-integrity/node_modules/esprima/"),
      packageDependencies: new Map([
        ["esprima", "4.0.1"],
      ]),
    }],
  ])],
  ["minimatch", new Map([
    ["3.0.4", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-minimatch-3.0.4-5166e286457f03306064be5497e8dbb0c3d32083-integrity/node_modules/minimatch/"),
      packageDependencies: new Map([
        ["brace-expansion", "1.1.11"],
        ["minimatch", "3.0.4"],
      ]),
    }],
  ])],
  ["brace-expansion", new Map([
    ["1.1.11", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-brace-expansion-1.1.11-3c7fcbf529d87226f3d2f52b966ff5271eb441dd-integrity/node_modules/brace-expansion/"),
      packageDependencies: new Map([
        ["balanced-match", "1.0.2"],
        ["concat-map", "0.0.1"],
        ["brace-expansion", "1.1.11"],
      ]),
    }],
  ])],
  ["balanced-match", new Map([
    ["1.0.2", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-balanced-match-1.0.2-e83e3a7e3f300b34cb9d87f615fa0cbf357690ee-integrity/node_modules/balanced-match/"),
      packageDependencies: new Map([
        ["balanced-match", "1.0.2"],
      ]),
    }],
  ])],
  ["concat-map", new Map([
    ["0.0.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-concat-map-0.0.1-d8a96bd77fd68df7793a73036a3ba0d5405d477b-integrity/node_modules/concat-map/"),
      packageDependencies: new Map([
        ["concat-map", "0.0.1"],
      ]),
    }],
  ])],
  ["strip-json-comments", new Map([
    ["3.1.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-strip-json-comments-3.1.1-31f1281b3832630434831c310c01cccda8cbe006-integrity/node_modules/strip-json-comments/"),
      packageDependencies: new Map([
        ["strip-json-comments", "3.1.1"],
      ]),
    }],
  ])],
  ["@humanwhocodes/config-array", new Map([
    ["0.5.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-@humanwhocodes-config-array-0.5.0-1407967d4c6eecd7388f83acf1eaf4d0c6e58ef9-integrity/node_modules/@humanwhocodes/config-array/"),
      packageDependencies: new Map([
        ["@humanwhocodes/object-schema", "1.2.0"],
        ["debug", "4.3.2"],
        ["minimatch", "3.0.4"],
        ["@humanwhocodes/config-array", "0.5.0"],
      ]),
    }],
  ])],
  ["@humanwhocodes/object-schema", new Map([
    ["1.2.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-@humanwhocodes-object-schema-1.2.0-87de7af9c231826fdd68ac7258f77c429e0e5fcf-integrity/node_modules/@humanwhocodes/object-schema/"),
      packageDependencies: new Map([
        ["@humanwhocodes/object-schema", "1.2.0"],
      ]),
    }],
  ])],
  ["cross-spawn", new Map([
    ["7.0.3", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-cross-spawn-7.0.3-f73a85b9d5d41d045551c177e2882d4ac85728a6-integrity/node_modules/cross-spawn/"),
      packageDependencies: new Map([
        ["path-key", "3.1.1"],
        ["shebang-command", "2.0.0"],
        ["which", "2.0.2"],
        ["cross-spawn", "7.0.3"],
      ]),
    }],
  ])],
  ["path-key", new Map([
    ["3.1.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-path-key-3.1.1-581f6ade658cbba65a0d3380de7753295054f375-integrity/node_modules/path-key/"),
      packageDependencies: new Map([
        ["path-key", "3.1.1"],
      ]),
    }],
  ])],
  ["shebang-command", new Map([
    ["2.0.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-shebang-command-2.0.0-ccd0af4f8835fbdc265b82461aaf0c36663f34ea-integrity/node_modules/shebang-command/"),
      packageDependencies: new Map([
        ["shebang-regex", "3.0.0"],
        ["shebang-command", "2.0.0"],
      ]),
    }],
  ])],
  ["shebang-regex", new Map([
    ["3.0.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-shebang-regex-3.0.0-ae16f1644d873ecad843b0307b143362d4c42172-integrity/node_modules/shebang-regex/"),
      packageDependencies: new Map([
        ["shebang-regex", "3.0.0"],
      ]),
    }],
  ])],
  ["which", new Map([
    ["2.0.2", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-which-2.0.2-7c6a8dd0a636a0327e10b59c9286eee93f3f51b1-integrity/node_modules/which/"),
      packageDependencies: new Map([
        ["isexe", "2.0.0"],
        ["which", "2.0.2"],
      ]),
    }],
  ])],
  ["isexe", new Map([
    ["2.0.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-isexe-2.0.0-e8fbf374dc556ff8947a10dcb0572d633f2cfa10-integrity/node_modules/isexe/"),
      packageDependencies: new Map([
        ["isexe", "2.0.0"],
      ]),
    }],
  ])],
  ["doctrine", new Map([
    ["3.0.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-doctrine-3.0.0-addebead72a6574db783639dc87a121773973961-integrity/node_modules/doctrine/"),
      packageDependencies: new Map([
        ["esutils", "2.0.3"],
        ["doctrine", "3.0.0"],
      ]),
    }],
  ])],
  ["esutils", new Map([
    ["2.0.3", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-esutils-2.0.3-74d2eb4de0b8da1293711910d50775b9b710ef64-integrity/node_modules/esutils/"),
      packageDependencies: new Map([
        ["esutils", "2.0.3"],
      ]),
    }],
  ])],
  ["enquirer", new Map([
    ["2.3.6", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-enquirer-2.3.6-2a7fe5dd634a1e4125a975ec994ff5456dc3734d-integrity/node_modules/enquirer/"),
      packageDependencies: new Map([
        ["ansi-colors", "4.1.1"],
        ["enquirer", "2.3.6"],
      ]),
    }],
  ])],
  ["ansi-colors", new Map([
    ["4.1.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-ansi-colors-4.1.1-cbb9ae256bf750af1eab344f229aa27fe94ba348-integrity/node_modules/ansi-colors/"),
      packageDependencies: new Map([
        ["ansi-colors", "4.1.1"],
      ]),
    }],
  ])],
  ["esquery", new Map([
    ["1.4.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-esquery-1.4.0-2148ffc38b82e8c7057dfed48425b3e61f0f24a5-integrity/node_modules/esquery/"),
      packageDependencies: new Map([
        ["estraverse", "5.2.0"],
        ["esquery", "1.4.0"],
      ]),
    }],
  ])],
  ["file-entry-cache", new Map([
    ["6.0.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-file-entry-cache-6.0.1-211b2dd9659cb0394b073e7323ac3c933d522027-integrity/node_modules/file-entry-cache/"),
      packageDependencies: new Map([
        ["flat-cache", "3.0.4"],
        ["file-entry-cache", "6.0.1"],
      ]),
    }],
  ])],
  ["flat-cache", new Map([
    ["3.0.4", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-flat-cache-3.0.4-61b0338302b2fe9f957dcc32fc2a87f1c3048b11-integrity/node_modules/flat-cache/"),
      packageDependencies: new Map([
        ["flatted", "3.2.1"],
        ["rimraf", "3.0.2"],
        ["flat-cache", "3.0.4"],
      ]),
    }],
  ])],
  ["flatted", new Map([
    ["3.2.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-flatted-3.2.1-bbef080d95fca6709362c73044a1634f7c6e7d05-integrity/node_modules/flatted/"),
      packageDependencies: new Map([
        ["flatted", "3.2.1"],
      ]),
    }],
  ])],
  ["rimraf", new Map([
    ["3.0.2", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-rimraf-3.0.2-f1a5402ba6220ad52cc1282bac1ae3aa49fd061a-integrity/node_modules/rimraf/"),
      packageDependencies: new Map([
        ["glob", "7.1.7"],
        ["rimraf", "3.0.2"],
      ]),
    }],
  ])],
  ["glob", new Map([
    ["7.1.7", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-glob-7.1.7-3b193e9233f01d42d0b3f78294bbeeb418f94a90-integrity/node_modules/glob/"),
      packageDependencies: new Map([
        ["fs.realpath", "1.0.0"],
        ["inflight", "1.0.6"],
        ["inherits", "2.0.4"],
        ["minimatch", "3.0.4"],
        ["once", "1.4.0"],
        ["path-is-absolute", "1.0.1"],
        ["glob", "7.1.7"],
      ]),
    }],
  ])],
  ["fs.realpath", new Map([
    ["1.0.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-fs-realpath-1.0.0-1504ad2523158caa40db4a2787cb01411994ea4f-integrity/node_modules/fs.realpath/"),
      packageDependencies: new Map([
        ["fs.realpath", "1.0.0"],
      ]),
    }],
  ])],
  ["inflight", new Map([
    ["1.0.6", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-inflight-1.0.6-49bd6331d7d02d0c09bc910a1075ba8165b56df9-integrity/node_modules/inflight/"),
      packageDependencies: new Map([
        ["once", "1.4.0"],
        ["wrappy", "1.0.2"],
        ["inflight", "1.0.6"],
      ]),
    }],
  ])],
  ["once", new Map([
    ["1.4.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-once-1.4.0-583b1aa775961d4b113ac17d9c50baef9dd76bd1-integrity/node_modules/once/"),
      packageDependencies: new Map([
        ["wrappy", "1.0.2"],
        ["once", "1.4.0"],
      ]),
    }],
  ])],
  ["wrappy", new Map([
    ["1.0.2", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-wrappy-1.0.2-b5243d8f3ec1aa35f1364605bc0d1036e30ab69f-integrity/node_modules/wrappy/"),
      packageDependencies: new Map([
        ["wrappy", "1.0.2"],
      ]),
    }],
  ])],
  ["path-is-absolute", new Map([
    ["1.0.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-path-is-absolute-1.0.1-174b9268735534ffbc7ace6bf53a5a9e1b5c5f5f-integrity/node_modules/path-is-absolute/"),
      packageDependencies: new Map([
        ["path-is-absolute", "1.0.1"],
      ]),
    }],
  ])],
  ["imurmurhash", new Map([
    ["0.1.4", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-imurmurhash-0.1.4-9218b9b2b928a238b13dc4fb6b6d576f231453ea-integrity/node_modules/imurmurhash/"),
      packageDependencies: new Map([
        ["imurmurhash", "0.1.4"],
      ]),
    }],
  ])],
  ["json-stable-stringify-without-jsonify", new Map([
    ["1.0.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-json-stable-stringify-without-jsonify-1.0.1-9db7b59496ad3f3cfef30a75142d2d930ad72651-integrity/node_modules/json-stable-stringify-without-jsonify/"),
      packageDependencies: new Map([
        ["json-stable-stringify-without-jsonify", "1.0.1"],
      ]),
    }],
  ])],
  ["levn", new Map([
    ["0.4.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-levn-0.4.1-ae4562c007473b932a6200d403268dd2fffc6ade-integrity/node_modules/levn/"),
      packageDependencies: new Map([
        ["prelude-ls", "1.2.1"],
        ["type-check", "0.4.0"],
        ["levn", "0.4.1"],
      ]),
    }],
  ])],
  ["prelude-ls", new Map([
    ["1.2.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-prelude-ls-1.2.1-debc6489d7a6e6b0e7611888cec880337d316396-integrity/node_modules/prelude-ls/"),
      packageDependencies: new Map([
        ["prelude-ls", "1.2.1"],
      ]),
    }],
  ])],
  ["type-check", new Map([
    ["0.4.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-type-check-0.4.0-07b8203bfa7056c0657050e3ccd2c37730bab8f1-integrity/node_modules/type-check/"),
      packageDependencies: new Map([
        ["prelude-ls", "1.2.1"],
        ["type-check", "0.4.0"],
      ]),
    }],
  ])],
  ["lodash.merge", new Map([
    ["4.6.2", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-lodash-merge-4.6.2-558aa53b43b661e1925a0afdfa36a9a1085fe57a-integrity/node_modules/lodash.merge/"),
      packageDependencies: new Map([
        ["lodash.merge", "4.6.2"],
      ]),
    }],
  ])],
  ["natural-compare", new Map([
    ["1.4.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-natural-compare-1.4.0-4abebfeed7541f2c27acfb29bdbbd15c8d5ba4f7-integrity/node_modules/natural-compare/"),
      packageDependencies: new Map([
        ["natural-compare", "1.4.0"],
      ]),
    }],
  ])],
  ["optionator", new Map([
    ["0.9.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-optionator-0.9.1-4f236a6373dae0566a6d43e1326674f50c291499-integrity/node_modules/optionator/"),
      packageDependencies: new Map([
        ["prelude-ls", "1.2.1"],
        ["deep-is", "0.1.3"],
        ["word-wrap", "1.2.3"],
        ["type-check", "0.4.0"],
        ["levn", "0.4.1"],
        ["fast-levenshtein", "2.0.6"],
        ["optionator", "0.9.1"],
      ]),
    }],
  ])],
  ["deep-is", new Map([
    ["0.1.3", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-deep-is-0.1.3-b369d6fb5dbc13eecf524f91b070feedc357cf34-integrity/node_modules/deep-is/"),
      packageDependencies: new Map([
        ["deep-is", "0.1.3"],
      ]),
    }],
  ])],
  ["word-wrap", new Map([
    ["1.2.3", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-word-wrap-1.2.3-610636f6b1f703891bd34771ccb17fb93b47079c-integrity/node_modules/word-wrap/"),
      packageDependencies: new Map([
        ["word-wrap", "1.2.3"],
      ]),
    }],
  ])],
  ["fast-levenshtein", new Map([
    ["2.0.6", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-fast-levenshtein-2.0.6-3d8a5c66883a16a30ca8643e851f19baa7797917-integrity/node_modules/fast-levenshtein/"),
      packageDependencies: new Map([
        ["fast-levenshtein", "2.0.6"],
      ]),
    }],
  ])],
  ["progress", new Map([
    ["2.0.3", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-progress-2.0.3-7e8cf8d8f5b8f239c1bc68beb4eb78567d572ef8-integrity/node_modules/progress/"),
      packageDependencies: new Map([
        ["progress", "2.0.3"],
      ]),
    }],
  ])],
  ["strip-ansi", new Map([
    ["6.0.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-strip-ansi-6.0.0-0b1571dd7669ccd4f3e06e14ef1eed26225ae532-integrity/node_modules/strip-ansi/"),
      packageDependencies: new Map([
        ["ansi-regex", "5.0.0"],
        ["strip-ansi", "6.0.0"],
      ]),
    }],
  ])],
  ["ansi-regex", new Map([
    ["5.0.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-ansi-regex-5.0.0-388539f55179bf39339c81af30a654d69f87cb75-integrity/node_modules/ansi-regex/"),
      packageDependencies: new Map([
        ["ansi-regex", "5.0.0"],
      ]),
    }],
  ])],
  ["table", new Map([
    ["6.7.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-table-6.7.1-ee05592b7143831a8c94f3cee6aae4c1ccef33e2-integrity/node_modules/table/"),
      packageDependencies: new Map([
        ["ajv", "8.6.2"],
        ["lodash.clonedeep", "4.5.0"],
        ["lodash.truncate", "4.4.2"],
        ["slice-ansi", "4.0.0"],
        ["string-width", "4.2.2"],
        ["strip-ansi", "6.0.0"],
        ["table", "6.7.1"],
      ]),
    }],
  ])],
  ["require-from-string", new Map([
    ["2.0.2", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-require-from-string-2.0.2-89a7fdd938261267318eafe14f9c32e598c36909-integrity/node_modules/require-from-string/"),
      packageDependencies: new Map([
        ["require-from-string", "2.0.2"],
      ]),
    }],
  ])],
  ["lodash.clonedeep", new Map([
    ["4.5.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-lodash-clonedeep-4.5.0-e23f3f9c4f8fbdde872529c1071857a086e5ccef-integrity/node_modules/lodash.clonedeep/"),
      packageDependencies: new Map([
        ["lodash.clonedeep", "4.5.0"],
      ]),
    }],
  ])],
  ["lodash.truncate", new Map([
    ["4.4.2", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-lodash-truncate-4.4.2-5a350da0b1113b837ecfffd5812cbe58d6eae193-integrity/node_modules/lodash.truncate/"),
      packageDependencies: new Map([
        ["lodash.truncate", "4.4.2"],
      ]),
    }],
  ])],
  ["slice-ansi", new Map([
    ["4.0.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-slice-ansi-4.0.0-500e8dd0fd55b05815086255b3195adf2a45fe6b-integrity/node_modules/slice-ansi/"),
      packageDependencies: new Map([
        ["ansi-styles", "4.3.0"],
        ["astral-regex", "2.0.0"],
        ["is-fullwidth-code-point", "3.0.0"],
        ["slice-ansi", "4.0.0"],
      ]),
    }],
  ])],
  ["astral-regex", new Map([
    ["2.0.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-astral-regex-2.0.0-483143c567aeed4785759c0865786dc77d7d2e31-integrity/node_modules/astral-regex/"),
      packageDependencies: new Map([
        ["astral-regex", "2.0.0"],
      ]),
    }],
  ])],
  ["is-fullwidth-code-point", new Map([
    ["3.0.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-is-fullwidth-code-point-3.0.0-f116f8064fe90b3f7844a38997c0b75051269f1d-integrity/node_modules/is-fullwidth-code-point/"),
      packageDependencies: new Map([
        ["is-fullwidth-code-point", "3.0.0"],
      ]),
    }],
  ])],
  ["string-width", new Map([
    ["4.2.2", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-string-width-4.2.2-dafd4f9559a7585cfba529c6a0a4f73488ebd4c5-integrity/node_modules/string-width/"),
      packageDependencies: new Map([
        ["emoji-regex", "8.0.0"],
        ["is-fullwidth-code-point", "3.0.0"],
        ["strip-ansi", "6.0.0"],
        ["string-width", "4.2.2"],
      ]),
    }],
  ])],
  ["emoji-regex", new Map([
    ["8.0.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-emoji-regex-8.0.0-e818fd69ce5ccfcb404594f842963bf53164cc37-integrity/node_modules/emoji-regex/"),
      packageDependencies: new Map([
        ["emoji-regex", "8.0.0"],
      ]),
    }],
  ])],
  ["text-table", new Map([
    ["0.2.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-text-table-0.2.0-7f5ee823ae805207c00af2df4a84ec3fcfa570b4-integrity/node_modules/text-table/"),
      packageDependencies: new Map([
        ["text-table", "0.2.0"],
      ]),
    }],
  ])],
  ["v8-compile-cache", new Map([
    ["2.3.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-v8-compile-cache-2.3.0-2de19618c66dc247dcfb6f99338035d8245a2cee-integrity/node_modules/v8-compile-cache/"),
      packageDependencies: new Map([
        ["v8-compile-cache", "2.3.0"],
      ]),
    }],
  ])],
  ["eslint-config-prettier", new Map([
    ["8.3.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-eslint-config-prettier-8.3.0-f7471b20b6fe8a9a9254cc684454202886a2dd7a-integrity/node_modules/eslint-config-prettier/"),
      packageDependencies: new Map([
        ["eslint", "7.31.0"],
        ["eslint-config-prettier", "8.3.0"],
      ]),
    }],
  ])],
  ["prettier", new Map([
    ["2.3.2", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-prettier-2.3.2-ef280a05ec253712e486233db5c6f23441e7342d-integrity/node_modules/prettier/"),
      packageDependencies: new Map([
        ["prettier", "2.3.2"],
      ]),
    }],
  ])],
  ["source-map-support", new Map([
    ["0.5.19", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-source-map-support-0.5.19-a98b62f86dcaf4f67399648c085291ab9e8fed61-integrity/node_modules/source-map-support/"),
      packageDependencies: new Map([
        ["buffer-from", "1.1.1"],
        ["source-map", "0.6.1"],
        ["source-map-support", "0.5.19"],
      ]),
    }],
  ])],
  ["buffer-from", new Map([
    ["1.1.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-buffer-from-1.1.1-32713bc028f75c02fdb710d7c7bcec1f2c6070ef-integrity/node_modules/buffer-from/"),
      packageDependencies: new Map([
        ["buffer-from", "1.1.1"],
      ]),
    }],
  ])],
  ["source-map", new Map([
    ["0.6.1", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-source-map-0.6.1-74722af32e9614e9c287a8d0bbde48b5e2f1a263-integrity/node_modules/source-map/"),
      packageDependencies: new Map([
        ["source-map", "0.6.1"],
      ]),
    }],
  ])],
  ["tsc-watch", new Map([
    ["4.4.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-tsc-watch-4.4.0-3ebbf1db54bcef6bfe534b330fa87284a4139320-integrity/node_modules/tsc-watch/"),
      packageDependencies: new Map([
        ["typescript", "4.3.5"],
        ["cross-spawn", "7.0.3"],
        ["node-cleanup", "2.1.2"],
        ["ps-tree", "1.2.0"],
        ["string-argv", "0.1.2"],
        ["strip-ansi", "6.0.0"],
        ["tsc-watch", "4.4.0"],
      ]),
    }],
  ])],
  ["node-cleanup", new Map([
    ["2.1.2", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-node-cleanup-2.1.2-7ac19abd297e09a7f72a71545d951b517e4dde2c-integrity/node_modules/node-cleanup/"),
      packageDependencies: new Map([
        ["node-cleanup", "2.1.2"],
      ]),
    }],
  ])],
  ["ps-tree", new Map([
    ["1.2.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-ps-tree-1.2.0-5e7425b89508736cdd4f2224d028f7bb3f722ebd-integrity/node_modules/ps-tree/"),
      packageDependencies: new Map([
        ["event-stream", "3.3.4"],
        ["ps-tree", "1.2.0"],
      ]),
    }],
  ])],
  ["event-stream", new Map([
    ["3.3.4", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-event-stream-3.3.4-4ab4c9a0f5a54db9338b4c34d86bfce8f4b35571-integrity/node_modules/event-stream/"),
      packageDependencies: new Map([
        ["through", "2.3.8"],
        ["duplexer", "0.1.2"],
        ["from", "0.1.7"],
        ["map-stream", "0.1.0"],
        ["pause-stream", "0.0.11"],
        ["split", "0.3.3"],
        ["stream-combiner", "0.0.4"],
        ["event-stream", "3.3.4"],
      ]),
    }],
  ])],
  ["through", new Map([
    ["2.3.8", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-through-2.3.8-0dd4c9ffaabc357960b1b724115d7e0e86a2e1f5-integrity/node_modules/through/"),
      packageDependencies: new Map([
        ["through", "2.3.8"],
      ]),
    }],
  ])],
  ["duplexer", new Map([
    ["0.1.2", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-duplexer-0.1.2-3abe43aef3835f8ae077d136ddce0f276b0400e6-integrity/node_modules/duplexer/"),
      packageDependencies: new Map([
        ["duplexer", "0.1.2"],
      ]),
    }],
  ])],
  ["from", new Map([
    ["0.1.7", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-from-0.1.7-83c60afc58b9c56997007ed1a768b3ab303a44fe-integrity/node_modules/from/"),
      packageDependencies: new Map([
        ["from", "0.1.7"],
      ]),
    }],
  ])],
  ["map-stream", new Map([
    ["0.1.0", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-map-stream-0.1.0-e56aa94c4c8055a16404a0674b78f215f7c8e194-integrity/node_modules/map-stream/"),
      packageDependencies: new Map([
        ["map-stream", "0.1.0"],
      ]),
    }],
  ])],
  ["pause-stream", new Map([
    ["0.0.11", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-pause-stream-0.0.11-fe5a34b0cbce12b5aa6a2b403ee2e73b602f1445-integrity/node_modules/pause-stream/"),
      packageDependencies: new Map([
        ["through", "2.3.8"],
        ["pause-stream", "0.0.11"],
      ]),
    }],
  ])],
  ["split", new Map([
    ["0.3.3", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-split-0.3.3-cd0eea5e63a211dfff7eb0f091c4133e2d0dd28f-integrity/node_modules/split/"),
      packageDependencies: new Map([
        ["through", "2.3.8"],
        ["split", "0.3.3"],
      ]),
    }],
  ])],
  ["stream-combiner", new Map([
    ["0.0.4", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-stream-combiner-0.0.4-4d5e433c185261dde623ca3f44c586bcf5c4ad14-integrity/node_modules/stream-combiner/"),
      packageDependencies: new Map([
        ["duplexer", "0.1.2"],
        ["stream-combiner", "0.0.4"],
      ]),
    }],
  ])],
  ["string-argv", new Map([
    ["0.1.2", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-string-argv-0.1.2-c5b7bc03fb2b11983ba3a72333dd0559e77e4738-integrity/node_modules/string-argv/"),
      packageDependencies: new Map([
        ["string-argv", "0.1.2"],
      ]),
    }],
  ])],
  ["typescript", new Map([
    ["4.3.5", {
      packageLocation: path.resolve(__dirname, "../../AppData/Local/Yarn/Cache/v6/npm-typescript-4.3.5-4d1c37cc16e893973c45a06886b7113234f119f4-integrity/node_modules/typescript/"),
      packageDependencies: new Map([
        ["typescript", "4.3.5"],
      ]),
    }],
  ])],
  [null, new Map([
    [null, {
      packageLocation: path.resolve(__dirname, "./"),
      packageDependencies: new Map([
        ["discord-akairo", "8.2.2"],
        ["discord-api-types", "0.20.2"],
        ["discord.js", "13.0.0-dev.4886ae2.1627214570"],
        ["monk", "7.3.4"],
        ["yup", "0.32.9"],
        ["@types/node", "16.4.2"],
        ["@types/prettier", "2.3.2"],
        ["@typescript-eslint/eslint-plugin", "4.28.4"],
        ["@typescript-eslint/parser", "4.28.4"],
        ["eslint", "7.31.0"],
        ["eslint-config-prettier", "8.3.0"],
        ["prettier", "2.3.2"],
        ["rimraf", "3.0.2"],
        ["source-map-support", "0.5.19"],
        ["tsc-watch", "4.4.0"],
        ["typescript", "4.3.5"],
      ]),
    }],
  ])],
]);

let locatorsByLocations = new Map([
  ["./.pnp/externals/pnp-76e173d2a9278dcfef5ba56f0e96a09a5e3e4d49/node_modules/tsutils/", blacklistedLocator],
  ["./.pnp/externals/pnp-6485638f2e2eb43d324f143714fd5e85d715493a/node_modules/tsutils/", blacklistedLocator],
  ["../../AppData/Local/Yarn/Cache/v6/npm-discord-akairo-8.2.2-ad4663a2d03b8839ab02a46a59a76fb5a92383c9/node_modules/discord-akairo/", {"name":"discord-akairo","reference":"8.2.2"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-discord-api-types-0.20.2-ab1951b7b92743d790508eb2c5480ccbf74928bd/node_modules/discord-api-types/", {"name":"discord-api-types","reference":"0.20.2"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-discord-api-types-0.18.1-5d08ed1263236be9c21a22065d0e6b51f790f492-integrity/node_modules/discord-api-types/", {"name":"discord-api-types","reference":"0.18.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-discord-api-types-0.19.0-86ba8021b29190cf860e90a2bc3e29b1d7aab3ba-integrity/node_modules/discord-api-types/", {"name":"discord-api-types","reference":"0.19.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-discord-js-13.0.0-dev.4886ae2.1627214570-efe856ceb02b9c774508337270f16e9a11ff2128-integrity/node_modules/discord.js/", {"name":"discord.js","reference":"13.0.0-dev.4886ae2.1627214570"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-@discordjs-builders-0.2.0-832c8d894aad13362db7a99f11a7826b21e4cd94-integrity/node_modules/@discordjs/builders/", {"name":"@discordjs/builders","reference":"0.2.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-tslib-2.3.0-803b8cdab3e12ba581a4ca41c8839bbb0dacb09e-integrity/node_modules/tslib/", {"name":"tslib","reference":"2.3.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-tslib-1.14.1-cf2d38bdc34a134bcaf1091c41f6619e2f672d00-integrity/node_modules/tslib/", {"name":"tslib","reference":"1.14.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-@discordjs-collection-0.1.6-9e9a7637f4e4e0688fd8b2b5c63133c91607682c-integrity/node_modules/@discordjs/collection/", {"name":"@discordjs/collection","reference":"0.1.6"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-@discordjs-form-data-3.0.1-5c9e6be992e2e57d0dfa0e39979a850225fb4697-integrity/node_modules/@discordjs/form-data/", {"name":"@discordjs/form-data","reference":"3.0.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-asynckit-0.4.0-c79ed97f7f34cb8f2ba1bc9790bcc366474b4b79-integrity/node_modules/asynckit/", {"name":"asynckit","reference":"0.4.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-combined-stream-1.0.8-c3d45a8b34fd730631a110a8a2520682b31d5a7f-integrity/node_modules/combined-stream/", {"name":"combined-stream","reference":"1.0.8"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-delayed-stream-1.0.0-df3ae199acadfb7d440aaae0b29e2272b24ec619-integrity/node_modules/delayed-stream/", {"name":"delayed-stream","reference":"1.0.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-mime-types-2.1.31-a00d76b74317c61f9c2db2218b8e9f8e9c5c9e6b-integrity/node_modules/mime-types/", {"name":"mime-types","reference":"2.1.31"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-mime-db-1.48.0-e35b31045dd7eada3aaad537ed88a33afbef2d1d-integrity/node_modules/mime-db/", {"name":"mime-db","reference":"1.48.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-@sapphire-async-queue-1.1.4-ae431310917a8880961cebe8e59df6ffa40f2957-integrity/node_modules/@sapphire/async-queue/", {"name":"@sapphire/async-queue","reference":"1.1.4"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-@types-ws-7.4.7-f7c390a36f7a0679aa69de2d501319f4f8d9b702-integrity/node_modules/@types/ws/", {"name":"@types/ws","reference":"7.4.7"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-@types-node-16.4.2-0a95d7fd950cb1eaca0ce11031d72e8f680b775a-integrity/node_modules/@types/node/", {"name":"@types/node","reference":"16.4.2"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-abort-controller-3.0.0-eaf54d53b62bae4138e809ca225c8439a6efb392-integrity/node_modules/abort-controller/", {"name":"abort-controller","reference":"3.0.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-event-target-shim-5.0.1-5d4d3ebdf9583d63a5333ce2deb7480ab2b05789-integrity/node_modules/event-target-shim/", {"name":"event-target-shim","reference":"5.0.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-node-fetch-2.6.1-045bd323631f76ed2e2b55573394416b639a0052-integrity/node_modules/node-fetch/", {"name":"node-fetch","reference":"2.6.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-ws-7.5.3-160835b63c7d97bfab418fc1b8a9fced2ac01a74-integrity/node_modules/ws/", {"name":"ws","reference":"7.5.3"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-monk-7.3.4-50ccd7daebb4c16ace58d45b2c28c29112f8a85e-integrity/node_modules/monk/", {"name":"monk","reference":"7.3.4"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-@types-mongodb-3.6.20-b7c5c580644f6364002b649af1c06c3c0454e1d2-integrity/node_modules/@types/mongodb/", {"name":"@types/mongodb","reference":"3.6.20"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-@types-bson-4.0.4-79d2d26e81070044db2a1a8b2cc2f673c840e1e5-integrity/node_modules/@types/bson/", {"name":"@types/bson","reference":"4.0.4"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-debug-4.3.2-f0a49c18ac8779e31d4a0c6029dfb76873c7428b-integrity/node_modules/debug/", {"name":"debug","reference":"4.3.2"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-ms-2.1.2-d09d1f357b443f493382a8eb3ccd183872ae6009-integrity/node_modules/ms/", {"name":"ms","reference":"2.1.2"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-mongodb-3.6.10-f10e990113c86b195c8af0599b9b3a90748b6ee4-integrity/node_modules/mongodb/", {"name":"mongodb","reference":"3.6.10"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-bl-2.2.1-8c11a7b730655c5d56898cdc871224f40fd901d5-integrity/node_modules/bl/", {"name":"bl","reference":"2.2.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-readable-stream-2.3.7-1eca1cf711aef814c04f62252a36a62f6cb23b57-integrity/node_modules/readable-stream/", {"name":"readable-stream","reference":"2.3.7"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-core-util-is-1.0.2-b5fd54220aa2bc5ab57aab7140c940754503c1a7-integrity/node_modules/core-util-is/", {"name":"core-util-is","reference":"1.0.2"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-inherits-2.0.4-0fa2c64f932917c3433a0ded55363aae37416b7c-integrity/node_modules/inherits/", {"name":"inherits","reference":"2.0.4"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-isarray-1.0.0-bb935d48582cba168c06834957a54a3e07124f11-integrity/node_modules/isarray/", {"name":"isarray","reference":"1.0.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-process-nextick-args-2.0.1-7820d9b16120cc55ca9ae7792680ae7dba6d7fe2-integrity/node_modules/process-nextick-args/", {"name":"process-nextick-args","reference":"2.0.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-safe-buffer-5.1.2-991ec69d296e0313747d59bdfd2b745c35f8828d-integrity/node_modules/safe-buffer/", {"name":"safe-buffer","reference":"5.1.2"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-safe-buffer-5.2.1-1eaf9fa9bdb1fdd4ec75f58f9cdb4e6b7827eec6-integrity/node_modules/safe-buffer/", {"name":"safe-buffer","reference":"5.2.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-string-decoder-1.1.1-9cf1611ba62685d7030ae9e4ba34149c3af03fc8-integrity/node_modules/string_decoder/", {"name":"string_decoder","reference":"1.1.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-util-deprecate-1.0.2-450d4dc9fa70de732762fbd2d4a28981419a0ccf-integrity/node_modules/util-deprecate/", {"name":"util-deprecate","reference":"1.0.2"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-bson-1.1.6-fb819be9a60cd677e0853aee4ca712a785d6618a-integrity/node_modules/bson/", {"name":"bson","reference":"1.1.6"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-denque-1.5.0-773de0686ff2d8ec2ff92914316a47b73b1c73de-integrity/node_modules/denque/", {"name":"denque","reference":"1.5.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-optional-require-1.1.0-01dfbafbbc2e8d79e33558f5af3917f22cc35c2c-integrity/node_modules/optional-require/", {"name":"optional-require","reference":"1.1.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-require-at-1.0.6-9eb7e3c5e00727f5a4744070a7f560d4de4f6e6a-integrity/node_modules/require-at/", {"name":"require-at","reference":"1.0.6"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-saslprep-1.0.3-4c02f946b56cf54297e347ba1093e7acac4cf226-integrity/node_modules/saslprep/", {"name":"saslprep","reference":"1.0.3"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-sparse-bitfield-3.0.3-ff4ae6e68656056ba4b3e792ab3334d38273ca11-integrity/node_modules/sparse-bitfield/", {"name":"sparse-bitfield","reference":"3.0.3"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-memory-pager-1.5.0-d8751655d22d384682741c972f2c3d6dfa3e66b5-integrity/node_modules/memory-pager/", {"name":"memory-pager","reference":"1.5.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-monk-middleware-cast-ids-0.2.1-40c40e5a6cb33ccedc289220943275ee8861c529-integrity/node_modules/monk-middleware-cast-ids/", {"name":"monk-middleware-cast-ids","reference":"0.2.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-monk-middleware-fields-0.2.0-ff637af35f5948879ccb2be15a91360911bea6c1-integrity/node_modules/monk-middleware-fields/", {"name":"monk-middleware-fields","reference":"0.2.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-monk-middleware-handle-callback-0.2.2-47de6cc1248726c72a2be0c81bc4e68310c32146-integrity/node_modules/monk-middleware-handle-callback/", {"name":"monk-middleware-handle-callback","reference":"0.2.2"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-monk-middleware-options-0.2.1-58dae1c518d46636ebdff506fadfc773bb442886-integrity/node_modules/monk-middleware-options/", {"name":"monk-middleware-options","reference":"0.2.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-monk-middleware-query-0.2.0-a926c677d4a5620c62151b0a56d0c0c151675874-integrity/node_modules/monk-middleware-query/", {"name":"monk-middleware-query","reference":"0.2.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-monk-middleware-wait-for-connection-0.2.0-312958d30e588b57d09754dd7c97b4843316835a-integrity/node_modules/monk-middleware-wait-for-connection/", {"name":"monk-middleware-wait-for-connection","reference":"0.2.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-object-assign-4.1.1-2109adc7965887cfc05cbbd442cac8bfbb360863-integrity/node_modules/object-assign/", {"name":"object-assign","reference":"4.1.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-yup-0.32.9-9367bec6b1b0e39211ecbca598702e106019d872-integrity/node_modules/yup/", {"name":"yup","reference":"0.32.9"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-@babel-runtime-7.14.8-7119a56f421018852694290b9f9148097391b446-integrity/node_modules/@babel/runtime/", {"name":"@babel/runtime","reference":"7.14.8"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-regenerator-runtime-0.13.9-8925742a98ffd90814988d7566ad30ca3b263b52-integrity/node_modules/regenerator-runtime/", {"name":"regenerator-runtime","reference":"0.13.9"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-@types-lodash-4.14.171-f01b3a5fe3499e34b622c362a46a609fdb23573b-integrity/node_modules/@types/lodash/", {"name":"@types/lodash","reference":"4.14.171"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-lodash-4.17.21-679591c564c3bffaae8454cf0b3df370c3d6911c-integrity/node_modules/lodash/", {"name":"lodash","reference":"4.17.21"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-lodash-es-4.17.21-43e626c46e6591b7750beb2b50117390c609e3ee-integrity/node_modules/lodash-es/", {"name":"lodash-es","reference":"4.17.21"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-nanoclone-0.2.1-dd4090f8f1a110d26bb32c49ed2f5b9235209ed4-integrity/node_modules/nanoclone/", {"name":"nanoclone","reference":"0.2.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-property-expr-2.0.4-37b925478e58965031bb612ec5b3260f8241e910-integrity/node_modules/property-expr/", {"name":"property-expr","reference":"2.0.4"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-toposort-2.0.2-ae21768175d1559d48bef35420b2f4962f09c330-integrity/node_modules/toposort/", {"name":"toposort","reference":"2.0.2"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-@types-prettier-2.3.2-fc8c2825e4ed2142473b4a81064e6e081463d1b3-integrity/node_modules/@types/prettier/", {"name":"@types/prettier","reference":"2.3.2"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-@typescript-eslint-eslint-plugin-4.28.4-e73c8cabbf3f08dee0e1bda65ed4e622ae8f8921-integrity/node_modules/@typescript-eslint/eslint-plugin/", {"name":"@typescript-eslint/eslint-plugin","reference":"4.28.4"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-@typescript-eslint-experimental-utils-4.28.4-9c70c35ebed087a5c70fb0ecd90979547b7fec96-integrity/node_modules/@typescript-eslint/experimental-utils/", {"name":"@typescript-eslint/experimental-utils","reference":"4.28.4"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-@types-json-schema-7.0.8-edf1bf1dbf4e04413ca8e5b17b3b7d7d54b59818-integrity/node_modules/@types/json-schema/", {"name":"@types/json-schema","reference":"7.0.8"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-@typescript-eslint-scope-manager-4.28.4-bdbce9b6a644e34f767bd68bc17bb14353b9fe7f-integrity/node_modules/@typescript-eslint/scope-manager/", {"name":"@typescript-eslint/scope-manager","reference":"4.28.4"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-@typescript-eslint-types-4.28.4-41acbd79b5816b7c0dd7530a43d97d020d3aeb42-integrity/node_modules/@typescript-eslint/types/", {"name":"@typescript-eslint/types","reference":"4.28.4"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-@typescript-eslint-visitor-keys-4.28.4-92dacfefccd6751cbb0a964f06683bfd72d0c4d3-integrity/node_modules/@typescript-eslint/visitor-keys/", {"name":"@typescript-eslint/visitor-keys","reference":"4.28.4"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-eslint-visitor-keys-2.1.0-f65328259305927392c938ed44eb0a5c9b2bd303-integrity/node_modules/eslint-visitor-keys/", {"name":"eslint-visitor-keys","reference":"2.1.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-eslint-visitor-keys-1.3.0-30ebd1ef7c2fdff01c3a4f151044af25fab0523e-integrity/node_modules/eslint-visitor-keys/", {"name":"eslint-visitor-keys","reference":"1.3.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-@typescript-eslint-typescript-estree-4.28.4-252e6863278dc0727244be9e371eb35241c46d00-integrity/node_modules/@typescript-eslint/typescript-estree/", {"name":"@typescript-eslint/typescript-estree","reference":"4.28.4"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-globby-11.0.4-2cbaff77c2f2a62e71e9b2813a67b97a3a3001a5-integrity/node_modules/globby/", {"name":"globby","reference":"11.0.4"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-array-union-2.1.0-b798420adbeb1de828d84acd8a2e23d3efe85e8d-integrity/node_modules/array-union/", {"name":"array-union","reference":"2.1.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-dir-glob-3.0.1-56dbf73d992a4a93ba1584f4534063fd2e41717f-integrity/node_modules/dir-glob/", {"name":"dir-glob","reference":"3.0.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-path-type-4.0.0-84ed01c0a7ba380afe09d90a8c180dcd9d03043b-integrity/node_modules/path-type/", {"name":"path-type","reference":"4.0.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-fast-glob-3.2.7-fd6cb7a2d7e9aa7a7846111e85a196d6b2f766a1-integrity/node_modules/fast-glob/", {"name":"fast-glob","reference":"3.2.7"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-@nodelib-fs-stat-2.0.5-5bd262af94e9d25bd1e71b05deed44876a222e8b-integrity/node_modules/@nodelib/fs.stat/", {"name":"@nodelib/fs.stat","reference":"2.0.5"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-@nodelib-fs-walk-1.2.8-e95737e8bb6746ddedf69c556953494f196fe69a-integrity/node_modules/@nodelib/fs.walk/", {"name":"@nodelib/fs.walk","reference":"1.2.8"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-@nodelib-fs-scandir-2.1.5-7619c2eb21b25483f6d167548b4cfd5a7488c3d5-integrity/node_modules/@nodelib/fs.scandir/", {"name":"@nodelib/fs.scandir","reference":"2.1.5"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-run-parallel-1.2.0-66d1368da7bdf921eb9d95bd1a9229e7f21a43ee-integrity/node_modules/run-parallel/", {"name":"run-parallel","reference":"1.2.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-queue-microtask-1.2.3-4929228bbc724dfac43e0efb058caf7b6cfb6243-integrity/node_modules/queue-microtask/", {"name":"queue-microtask","reference":"1.2.3"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-fastq-1.11.1-5d8175aae17db61947f8b162cfc7f63264d22807-integrity/node_modules/fastq/", {"name":"fastq","reference":"1.11.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-reusify-1.0.4-90da382b1e126efc02146e90845a88db12925d76-integrity/node_modules/reusify/", {"name":"reusify","reference":"1.0.4"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-glob-parent-5.1.2-869832c58034fe68a4093c17dc15e8340d8401c4-integrity/node_modules/glob-parent/", {"name":"glob-parent","reference":"5.1.2"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-is-glob-4.0.1-7567dbe9f2f5e2467bc77ab83c4a29482407a5dc-integrity/node_modules/is-glob/", {"name":"is-glob","reference":"4.0.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-is-extglob-2.1.1-a88c02535791f02ed37c76a1b9ea9773c833f8c2-integrity/node_modules/is-extglob/", {"name":"is-extglob","reference":"2.1.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-merge2-1.4.1-4368892f885e907455a6fd7dc55c0c9d404990ae-integrity/node_modules/merge2/", {"name":"merge2","reference":"1.4.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-micromatch-4.0.4-896d519dfe9db25fce94ceb7a500919bf881ebf9-integrity/node_modules/micromatch/", {"name":"micromatch","reference":"4.0.4"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-braces-3.0.2-3454e1a462ee8d599e236df336cd9ea4f8afe107-integrity/node_modules/braces/", {"name":"braces","reference":"3.0.2"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-fill-range-7.0.1-1919a6a7c75fe38b2c7c77e5198535da9acdda40-integrity/node_modules/fill-range/", {"name":"fill-range","reference":"7.0.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-to-regex-range-5.0.1-1648c44aae7c8d988a326018ed72f5b4dd0392e4-integrity/node_modules/to-regex-range/", {"name":"to-regex-range","reference":"5.0.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-is-number-7.0.0-7535345b896734d5f80c4d06c50955527a14f12b-integrity/node_modules/is-number/", {"name":"is-number","reference":"7.0.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-picomatch-2.3.0-f1f061de8f6a4bf022892e2d128234fb98302972-integrity/node_modules/picomatch/", {"name":"picomatch","reference":"2.3.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-ignore-5.1.8-f150a8b50a34289b33e22f5889abd4d8016f0e57-integrity/node_modules/ignore/", {"name":"ignore","reference":"5.1.8"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-ignore-4.0.6-750e3db5862087b4737ebac8207ffd1ef27b25fc-integrity/node_modules/ignore/", {"name":"ignore","reference":"4.0.6"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-slash-3.0.0-6539be870c165adbd5240220dbe361f1bc4d4634-integrity/node_modules/slash/", {"name":"slash","reference":"3.0.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-semver-7.3.5-0b621c879348d8998e4b0e4be94b3f12e6018ef7-integrity/node_modules/semver/", {"name":"semver","reference":"7.3.5"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-lru-cache-6.0.0-6d6fe6570ebd96aaf90fcad1dafa3b2566db3a94-integrity/node_modules/lru-cache/", {"name":"lru-cache","reference":"6.0.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-yallist-4.0.0-9bb92790d9c0effec63be73519e11a35019a3a72-integrity/node_modules/yallist/", {"name":"yallist","reference":"4.0.0"}],
  ["./.pnp/externals/pnp-6485638f2e2eb43d324f143714fd5e85d715493a/node_modules/tsutils/", {"name":"tsutils","reference":"pnp:6485638f2e2eb43d324f143714fd5e85d715493a"}],
  ["./.pnp/externals/pnp-76e173d2a9278dcfef5ba56f0e96a09a5e3e4d49/node_modules/tsutils/", {"name":"tsutils","reference":"pnp:76e173d2a9278dcfef5ba56f0e96a09a5e3e4d49"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-eslint-scope-5.1.1-e786e59a66cb92b3f6c1fb0d508aab174848f48c-integrity/node_modules/eslint-scope/", {"name":"eslint-scope","reference":"5.1.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-esrecurse-4.3.0-7ad7964d679abb28bee72cec63758b1c5d2c9921-integrity/node_modules/esrecurse/", {"name":"esrecurse","reference":"4.3.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-estraverse-5.2.0-307df42547e6cc7324d3cf03c155d5cdb8c53880-integrity/node_modules/estraverse/", {"name":"estraverse","reference":"5.2.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-estraverse-4.3.0-398ad3f3c5a24948be7725e83d11a7de28cdbd1d-integrity/node_modules/estraverse/", {"name":"estraverse","reference":"4.3.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-eslint-utils-3.0.0-8aebaface7345bb33559db0a1f13a1d2d48c3672-integrity/node_modules/eslint-utils/", {"name":"eslint-utils","reference":"3.0.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-eslint-utils-2.1.0-d2de5e03424e707dc10c74068ddedae708741b27-integrity/node_modules/eslint-utils/", {"name":"eslint-utils","reference":"2.1.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-functional-red-black-tree-1.0.1-1b0ab3bd553b2a0d6399d29c0e3ea0b252078327-integrity/node_modules/functional-red-black-tree/", {"name":"functional-red-black-tree","reference":"1.0.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-regexpp-3.2.0-0425a2768d8f23bad70ca4b90461fa2f1213e1b2-integrity/node_modules/regexpp/", {"name":"regexpp","reference":"3.2.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-@typescript-eslint-parser-4.28.4-bc462dc2779afeefdcf49082516afdc3e7b96fab-integrity/node_modules/@typescript-eslint/parser/", {"name":"@typescript-eslint/parser","reference":"4.28.4"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-eslint-7.31.0-f972b539424bf2604907a970860732c5d99d3aca-integrity/node_modules/eslint/", {"name":"eslint","reference":"7.31.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-@babel-code-frame-7.12.11-f4ad435aa263db935b8f10f2c552d23fb716a63f-integrity/node_modules/@babel/code-frame/", {"name":"@babel/code-frame","reference":"7.12.11"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-@babel-highlight-7.14.5-6861a52f03966405001f6aa534a01a24d99e8cd9-integrity/node_modules/@babel/highlight/", {"name":"@babel/highlight","reference":"7.14.5"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-@babel-helper-validator-identifier-7.14.8-32be33a756f29e278a0d644fa08a2c9e0f88a34c-integrity/node_modules/@babel/helper-validator-identifier/", {"name":"@babel/helper-validator-identifier","reference":"7.14.8"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-chalk-2.4.2-cd42541677a54333cf541a49108c1432b44c9424-integrity/node_modules/chalk/", {"name":"chalk","reference":"2.4.2"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-chalk-4.1.1-c80b3fab28bf6371e6863325eee67e618b77e6ad-integrity/node_modules/chalk/", {"name":"chalk","reference":"4.1.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-ansi-styles-3.2.1-41fbb20243e50b12be0f04b8dedbf07520ce841d-integrity/node_modules/ansi-styles/", {"name":"ansi-styles","reference":"3.2.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-ansi-styles-4.3.0-edd803628ae71c04c85ae7a0906edad34b648937-integrity/node_modules/ansi-styles/", {"name":"ansi-styles","reference":"4.3.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-color-convert-1.9.3-bb71850690e1f136567de629d2d5471deda4c1e8-integrity/node_modules/color-convert/", {"name":"color-convert","reference":"1.9.3"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-color-convert-2.0.1-72d3a68d598c9bdb3af2ad1e84f21d896abd4de3-integrity/node_modules/color-convert/", {"name":"color-convert","reference":"2.0.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-color-name-1.1.3-a7d0558bd89c42f795dd42328f740831ca53bc25-integrity/node_modules/color-name/", {"name":"color-name","reference":"1.1.3"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-color-name-1.1.4-c2a09a87acbde69543de6f63fa3995c826c536a2-integrity/node_modules/color-name/", {"name":"color-name","reference":"1.1.4"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-escape-string-regexp-1.0.5-1b61c0562190a8dff6ae3bb2cf0200ca130b86d4-integrity/node_modules/escape-string-regexp/", {"name":"escape-string-regexp","reference":"1.0.5"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-escape-string-regexp-4.0.0-14ba83a5d373e3d311e5afca29cf5bfad965bf34-integrity/node_modules/escape-string-regexp/", {"name":"escape-string-regexp","reference":"4.0.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-supports-color-5.5.0-e2e69a44ac8772f78a1ec0b35b689df6530efc8f-integrity/node_modules/supports-color/", {"name":"supports-color","reference":"5.5.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-supports-color-7.2.0-1b7dcdcb32b8138801b3e478ba6a51caa89648da-integrity/node_modules/supports-color/", {"name":"supports-color","reference":"7.2.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-has-flag-3.0.0-b5d454dc2199ae225699f3467e5a07f3b955bafd-integrity/node_modules/has-flag/", {"name":"has-flag","reference":"3.0.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-has-flag-4.0.0-944771fd9c81c81265c4d6941860da06bb59479b-integrity/node_modules/has-flag/", {"name":"has-flag","reference":"4.0.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-js-tokens-4.0.0-19203fb59991df98e3a287050d4647cdeaf32499-integrity/node_modules/js-tokens/", {"name":"js-tokens","reference":"4.0.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-@eslint-eslintrc-0.4.3-9e42981ef035beb3dd49add17acb96e8ff6f394c-integrity/node_modules/@eslint/eslintrc/", {"name":"@eslint/eslintrc","reference":"0.4.3"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-ajv-6.12.6-baf5a62e802b07d977034586f8c3baf5adf26df4-integrity/node_modules/ajv/", {"name":"ajv","reference":"6.12.6"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-ajv-8.6.2-2fb45e0e5fcbc0813326c1c3da535d1881bb0571-integrity/node_modules/ajv/", {"name":"ajv","reference":"8.6.2"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-fast-deep-equal-3.1.3-3a7d56b559d6cbc3eb512325244e619a65c6c525-integrity/node_modules/fast-deep-equal/", {"name":"fast-deep-equal","reference":"3.1.3"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-fast-json-stable-stringify-2.1.0-874bf69c6f404c2b5d99c481341399fd55892633-integrity/node_modules/fast-json-stable-stringify/", {"name":"fast-json-stable-stringify","reference":"2.1.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-json-schema-traverse-0.4.1-69f6a87d9513ab8bb8fe63bdb0979c448e684660-integrity/node_modules/json-schema-traverse/", {"name":"json-schema-traverse","reference":"0.4.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-json-schema-traverse-1.0.0-ae7bcb3656ab77a73ba5c49bf654f38e6b6860e2-integrity/node_modules/json-schema-traverse/", {"name":"json-schema-traverse","reference":"1.0.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-uri-js-4.4.1-9b1a52595225859e55f669d928f88c6c57f2a77e-integrity/node_modules/uri-js/", {"name":"uri-js","reference":"4.4.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-punycode-2.1.1-b58b010ac40c22c5657616c8d2c2c02c7bf479ec-integrity/node_modules/punycode/", {"name":"punycode","reference":"2.1.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-espree-7.3.1-f2df330b752c6f55019f8bd89b7660039c1bbbb6-integrity/node_modules/espree/", {"name":"espree","reference":"7.3.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-acorn-7.4.1-feaed255973d2e77555b83dbc08851a6c63520fa-integrity/node_modules/acorn/", {"name":"acorn","reference":"7.4.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-acorn-jsx-5.3.2-7ed5bb55908b3b2f1bc55c6af1653bada7f07937-integrity/node_modules/acorn-jsx/", {"name":"acorn-jsx","reference":"5.3.2"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-globals-13.10.0-60ba56c3ac2ca845cfbf4faeca727ad9dd204676-integrity/node_modules/globals/", {"name":"globals","reference":"13.10.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-type-fest-0.20.2-1bf207f4b28f91583666cb5fbd327887301cd5f4-integrity/node_modules/type-fest/", {"name":"type-fest","reference":"0.20.2"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-import-fresh-3.3.0-37162c25fcb9ebaa2e6e53d5b4d88ce17d9e0c2b-integrity/node_modules/import-fresh/", {"name":"import-fresh","reference":"3.3.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-parent-module-1.0.1-691d2709e78c79fae3a156622452d00762caaaa2-integrity/node_modules/parent-module/", {"name":"parent-module","reference":"1.0.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-callsites-3.1.0-b3630abd8943432f54b3f0519238e33cd7df2f73-integrity/node_modules/callsites/", {"name":"callsites","reference":"3.1.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-resolve-from-4.0.0-4abcd852ad32dd7baabfe9b40e00a36db5f392e6-integrity/node_modules/resolve-from/", {"name":"resolve-from","reference":"4.0.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-js-yaml-3.14.1-dae812fdb3825fa306609a8717383c50c36a0537-integrity/node_modules/js-yaml/", {"name":"js-yaml","reference":"3.14.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-argparse-1.0.10-bcd6791ea5ae09725e17e5ad988134cd40b3d911-integrity/node_modules/argparse/", {"name":"argparse","reference":"1.0.10"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-sprintf-js-1.0.3-04e6926f662895354f3dd015203633b857297e2c-integrity/node_modules/sprintf-js/", {"name":"sprintf-js","reference":"1.0.3"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-esprima-4.0.1-13b04cdb3e6c5d19df91ab6987a8695619b0aa71-integrity/node_modules/esprima/", {"name":"esprima","reference":"4.0.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-minimatch-3.0.4-5166e286457f03306064be5497e8dbb0c3d32083-integrity/node_modules/minimatch/", {"name":"minimatch","reference":"3.0.4"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-brace-expansion-1.1.11-3c7fcbf529d87226f3d2f52b966ff5271eb441dd-integrity/node_modules/brace-expansion/", {"name":"brace-expansion","reference":"1.1.11"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-balanced-match-1.0.2-e83e3a7e3f300b34cb9d87f615fa0cbf357690ee-integrity/node_modules/balanced-match/", {"name":"balanced-match","reference":"1.0.2"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-concat-map-0.0.1-d8a96bd77fd68df7793a73036a3ba0d5405d477b-integrity/node_modules/concat-map/", {"name":"concat-map","reference":"0.0.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-strip-json-comments-3.1.1-31f1281b3832630434831c310c01cccda8cbe006-integrity/node_modules/strip-json-comments/", {"name":"strip-json-comments","reference":"3.1.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-@humanwhocodes-config-array-0.5.0-1407967d4c6eecd7388f83acf1eaf4d0c6e58ef9-integrity/node_modules/@humanwhocodes/config-array/", {"name":"@humanwhocodes/config-array","reference":"0.5.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-@humanwhocodes-object-schema-1.2.0-87de7af9c231826fdd68ac7258f77c429e0e5fcf-integrity/node_modules/@humanwhocodes/object-schema/", {"name":"@humanwhocodes/object-schema","reference":"1.2.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-cross-spawn-7.0.3-f73a85b9d5d41d045551c177e2882d4ac85728a6-integrity/node_modules/cross-spawn/", {"name":"cross-spawn","reference":"7.0.3"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-path-key-3.1.1-581f6ade658cbba65a0d3380de7753295054f375-integrity/node_modules/path-key/", {"name":"path-key","reference":"3.1.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-shebang-command-2.0.0-ccd0af4f8835fbdc265b82461aaf0c36663f34ea-integrity/node_modules/shebang-command/", {"name":"shebang-command","reference":"2.0.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-shebang-regex-3.0.0-ae16f1644d873ecad843b0307b143362d4c42172-integrity/node_modules/shebang-regex/", {"name":"shebang-regex","reference":"3.0.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-which-2.0.2-7c6a8dd0a636a0327e10b59c9286eee93f3f51b1-integrity/node_modules/which/", {"name":"which","reference":"2.0.2"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-isexe-2.0.0-e8fbf374dc556ff8947a10dcb0572d633f2cfa10-integrity/node_modules/isexe/", {"name":"isexe","reference":"2.0.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-doctrine-3.0.0-addebead72a6574db783639dc87a121773973961-integrity/node_modules/doctrine/", {"name":"doctrine","reference":"3.0.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-esutils-2.0.3-74d2eb4de0b8da1293711910d50775b9b710ef64-integrity/node_modules/esutils/", {"name":"esutils","reference":"2.0.3"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-enquirer-2.3.6-2a7fe5dd634a1e4125a975ec994ff5456dc3734d-integrity/node_modules/enquirer/", {"name":"enquirer","reference":"2.3.6"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-ansi-colors-4.1.1-cbb9ae256bf750af1eab344f229aa27fe94ba348-integrity/node_modules/ansi-colors/", {"name":"ansi-colors","reference":"4.1.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-esquery-1.4.0-2148ffc38b82e8c7057dfed48425b3e61f0f24a5-integrity/node_modules/esquery/", {"name":"esquery","reference":"1.4.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-file-entry-cache-6.0.1-211b2dd9659cb0394b073e7323ac3c933d522027-integrity/node_modules/file-entry-cache/", {"name":"file-entry-cache","reference":"6.0.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-flat-cache-3.0.4-61b0338302b2fe9f957dcc32fc2a87f1c3048b11-integrity/node_modules/flat-cache/", {"name":"flat-cache","reference":"3.0.4"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-flatted-3.2.1-bbef080d95fca6709362c73044a1634f7c6e7d05-integrity/node_modules/flatted/", {"name":"flatted","reference":"3.2.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-rimraf-3.0.2-f1a5402ba6220ad52cc1282bac1ae3aa49fd061a-integrity/node_modules/rimraf/", {"name":"rimraf","reference":"3.0.2"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-glob-7.1.7-3b193e9233f01d42d0b3f78294bbeeb418f94a90-integrity/node_modules/glob/", {"name":"glob","reference":"7.1.7"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-fs-realpath-1.0.0-1504ad2523158caa40db4a2787cb01411994ea4f-integrity/node_modules/fs.realpath/", {"name":"fs.realpath","reference":"1.0.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-inflight-1.0.6-49bd6331d7d02d0c09bc910a1075ba8165b56df9-integrity/node_modules/inflight/", {"name":"inflight","reference":"1.0.6"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-once-1.4.0-583b1aa775961d4b113ac17d9c50baef9dd76bd1-integrity/node_modules/once/", {"name":"once","reference":"1.4.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-wrappy-1.0.2-b5243d8f3ec1aa35f1364605bc0d1036e30ab69f-integrity/node_modules/wrappy/", {"name":"wrappy","reference":"1.0.2"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-path-is-absolute-1.0.1-174b9268735534ffbc7ace6bf53a5a9e1b5c5f5f-integrity/node_modules/path-is-absolute/", {"name":"path-is-absolute","reference":"1.0.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-imurmurhash-0.1.4-9218b9b2b928a238b13dc4fb6b6d576f231453ea-integrity/node_modules/imurmurhash/", {"name":"imurmurhash","reference":"0.1.4"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-json-stable-stringify-without-jsonify-1.0.1-9db7b59496ad3f3cfef30a75142d2d930ad72651-integrity/node_modules/json-stable-stringify-without-jsonify/", {"name":"json-stable-stringify-without-jsonify","reference":"1.0.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-levn-0.4.1-ae4562c007473b932a6200d403268dd2fffc6ade-integrity/node_modules/levn/", {"name":"levn","reference":"0.4.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-prelude-ls-1.2.1-debc6489d7a6e6b0e7611888cec880337d316396-integrity/node_modules/prelude-ls/", {"name":"prelude-ls","reference":"1.2.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-type-check-0.4.0-07b8203bfa7056c0657050e3ccd2c37730bab8f1-integrity/node_modules/type-check/", {"name":"type-check","reference":"0.4.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-lodash-merge-4.6.2-558aa53b43b661e1925a0afdfa36a9a1085fe57a-integrity/node_modules/lodash.merge/", {"name":"lodash.merge","reference":"4.6.2"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-natural-compare-1.4.0-4abebfeed7541f2c27acfb29bdbbd15c8d5ba4f7-integrity/node_modules/natural-compare/", {"name":"natural-compare","reference":"1.4.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-optionator-0.9.1-4f236a6373dae0566a6d43e1326674f50c291499-integrity/node_modules/optionator/", {"name":"optionator","reference":"0.9.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-deep-is-0.1.3-b369d6fb5dbc13eecf524f91b070feedc357cf34-integrity/node_modules/deep-is/", {"name":"deep-is","reference":"0.1.3"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-word-wrap-1.2.3-610636f6b1f703891bd34771ccb17fb93b47079c-integrity/node_modules/word-wrap/", {"name":"word-wrap","reference":"1.2.3"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-fast-levenshtein-2.0.6-3d8a5c66883a16a30ca8643e851f19baa7797917-integrity/node_modules/fast-levenshtein/", {"name":"fast-levenshtein","reference":"2.0.6"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-progress-2.0.3-7e8cf8d8f5b8f239c1bc68beb4eb78567d572ef8-integrity/node_modules/progress/", {"name":"progress","reference":"2.0.3"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-strip-ansi-6.0.0-0b1571dd7669ccd4f3e06e14ef1eed26225ae532-integrity/node_modules/strip-ansi/", {"name":"strip-ansi","reference":"6.0.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-ansi-regex-5.0.0-388539f55179bf39339c81af30a654d69f87cb75-integrity/node_modules/ansi-regex/", {"name":"ansi-regex","reference":"5.0.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-table-6.7.1-ee05592b7143831a8c94f3cee6aae4c1ccef33e2-integrity/node_modules/table/", {"name":"table","reference":"6.7.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-require-from-string-2.0.2-89a7fdd938261267318eafe14f9c32e598c36909-integrity/node_modules/require-from-string/", {"name":"require-from-string","reference":"2.0.2"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-lodash-clonedeep-4.5.0-e23f3f9c4f8fbdde872529c1071857a086e5ccef-integrity/node_modules/lodash.clonedeep/", {"name":"lodash.clonedeep","reference":"4.5.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-lodash-truncate-4.4.2-5a350da0b1113b837ecfffd5812cbe58d6eae193-integrity/node_modules/lodash.truncate/", {"name":"lodash.truncate","reference":"4.4.2"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-slice-ansi-4.0.0-500e8dd0fd55b05815086255b3195adf2a45fe6b-integrity/node_modules/slice-ansi/", {"name":"slice-ansi","reference":"4.0.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-astral-regex-2.0.0-483143c567aeed4785759c0865786dc77d7d2e31-integrity/node_modules/astral-regex/", {"name":"astral-regex","reference":"2.0.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-is-fullwidth-code-point-3.0.0-f116f8064fe90b3f7844a38997c0b75051269f1d-integrity/node_modules/is-fullwidth-code-point/", {"name":"is-fullwidth-code-point","reference":"3.0.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-string-width-4.2.2-dafd4f9559a7585cfba529c6a0a4f73488ebd4c5-integrity/node_modules/string-width/", {"name":"string-width","reference":"4.2.2"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-emoji-regex-8.0.0-e818fd69ce5ccfcb404594f842963bf53164cc37-integrity/node_modules/emoji-regex/", {"name":"emoji-regex","reference":"8.0.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-text-table-0.2.0-7f5ee823ae805207c00af2df4a84ec3fcfa570b4-integrity/node_modules/text-table/", {"name":"text-table","reference":"0.2.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-v8-compile-cache-2.3.0-2de19618c66dc247dcfb6f99338035d8245a2cee-integrity/node_modules/v8-compile-cache/", {"name":"v8-compile-cache","reference":"2.3.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-eslint-config-prettier-8.3.0-f7471b20b6fe8a9a9254cc684454202886a2dd7a-integrity/node_modules/eslint-config-prettier/", {"name":"eslint-config-prettier","reference":"8.3.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-prettier-2.3.2-ef280a05ec253712e486233db5c6f23441e7342d-integrity/node_modules/prettier/", {"name":"prettier","reference":"2.3.2"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-source-map-support-0.5.19-a98b62f86dcaf4f67399648c085291ab9e8fed61-integrity/node_modules/source-map-support/", {"name":"source-map-support","reference":"0.5.19"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-buffer-from-1.1.1-32713bc028f75c02fdb710d7c7bcec1f2c6070ef-integrity/node_modules/buffer-from/", {"name":"buffer-from","reference":"1.1.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-source-map-0.6.1-74722af32e9614e9c287a8d0bbde48b5e2f1a263-integrity/node_modules/source-map/", {"name":"source-map","reference":"0.6.1"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-tsc-watch-4.4.0-3ebbf1db54bcef6bfe534b330fa87284a4139320-integrity/node_modules/tsc-watch/", {"name":"tsc-watch","reference":"4.4.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-node-cleanup-2.1.2-7ac19abd297e09a7f72a71545d951b517e4dde2c-integrity/node_modules/node-cleanup/", {"name":"node-cleanup","reference":"2.1.2"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-ps-tree-1.2.0-5e7425b89508736cdd4f2224d028f7bb3f722ebd-integrity/node_modules/ps-tree/", {"name":"ps-tree","reference":"1.2.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-event-stream-3.3.4-4ab4c9a0f5a54db9338b4c34d86bfce8f4b35571-integrity/node_modules/event-stream/", {"name":"event-stream","reference":"3.3.4"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-through-2.3.8-0dd4c9ffaabc357960b1b724115d7e0e86a2e1f5-integrity/node_modules/through/", {"name":"through","reference":"2.3.8"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-duplexer-0.1.2-3abe43aef3835f8ae077d136ddce0f276b0400e6-integrity/node_modules/duplexer/", {"name":"duplexer","reference":"0.1.2"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-from-0.1.7-83c60afc58b9c56997007ed1a768b3ab303a44fe-integrity/node_modules/from/", {"name":"from","reference":"0.1.7"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-map-stream-0.1.0-e56aa94c4c8055a16404a0674b78f215f7c8e194-integrity/node_modules/map-stream/", {"name":"map-stream","reference":"0.1.0"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-pause-stream-0.0.11-fe5a34b0cbce12b5aa6a2b403ee2e73b602f1445-integrity/node_modules/pause-stream/", {"name":"pause-stream","reference":"0.0.11"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-split-0.3.3-cd0eea5e63a211dfff7eb0f091c4133e2d0dd28f-integrity/node_modules/split/", {"name":"split","reference":"0.3.3"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-stream-combiner-0.0.4-4d5e433c185261dde623ca3f44c586bcf5c4ad14-integrity/node_modules/stream-combiner/", {"name":"stream-combiner","reference":"0.0.4"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-string-argv-0.1.2-c5b7bc03fb2b11983ba3a72333dd0559e77e4738-integrity/node_modules/string-argv/", {"name":"string-argv","reference":"0.1.2"}],
  ["../../AppData/Local/Yarn/Cache/v6/npm-typescript-4.3.5-4d1c37cc16e893973c45a06886b7113234f119f4-integrity/node_modules/typescript/", {"name":"typescript","reference":"4.3.5"}],
  ["./", topLevelLocator],
]);
exports.findPackageLocator = function findPackageLocator(location) {
  let relativeLocation = normalizePath(path.relative(__dirname, location));

  if (!relativeLocation.match(isStrictRegExp))
    relativeLocation = `./${relativeLocation}`;

  if (location.match(isDirRegExp) && relativeLocation.charAt(relativeLocation.length - 1) !== '/')
    relativeLocation = `${relativeLocation}/`;

  let match;

  if (relativeLocation.length >= 185 && relativeLocation[184] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 185)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 184 && relativeLocation[183] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 184)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 183 && relativeLocation[182] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 183)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 180 && relativeLocation[179] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 180)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 179 && relativeLocation[178] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 179)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 175 && relativeLocation[174] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 175)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 173 && relativeLocation[172] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 173)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 172 && relativeLocation[171] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 172)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 166 && relativeLocation[165] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 166)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 164 && relativeLocation[163] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 164)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 162 && relativeLocation[161] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 162)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 161 && relativeLocation[160] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 161)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 160 && relativeLocation[159] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 160)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 159 && relativeLocation[158] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 159)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 158 && relativeLocation[157] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 158)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 156 && relativeLocation[155] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 156)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 154 && relativeLocation[153] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 154)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 152 && relativeLocation[151] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 152)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 150 && relativeLocation[149] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 150)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 149 && relativeLocation[148] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 149)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 148 && relativeLocation[147] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 148)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 147 && relativeLocation[146] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 147)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 146 && relativeLocation[145] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 146)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 145 && relativeLocation[144] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 145)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 144 && relativeLocation[143] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 144)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 143 && relativeLocation[142] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 143)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 142 && relativeLocation[141] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 142)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 141 && relativeLocation[140] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 141)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 140 && relativeLocation[139] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 140)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 139 && relativeLocation[138] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 139)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 138 && relativeLocation[137] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 138)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 136 && relativeLocation[135] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 136)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 135 && relativeLocation[134] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 135)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 134 && relativeLocation[133] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 134)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 133 && relativeLocation[132] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 133)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 132 && relativeLocation[131] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 132)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 131 && relativeLocation[130] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 131)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 130 && relativeLocation[129] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 130)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 129 && relativeLocation[128] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 129)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 128 && relativeLocation[127] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 128)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 127 && relativeLocation[126] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 127)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 126 && relativeLocation[125] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 126)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 125 && relativeLocation[124] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 125)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 124 && relativeLocation[123] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 124)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 123 && relativeLocation[122] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 123)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 122 && relativeLocation[121] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 122)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 121 && relativeLocation[120] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 121)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 120 && relativeLocation[119] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 120)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 118 && relativeLocation[117] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 118)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 117 && relativeLocation[116] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 117)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 116 && relativeLocation[115] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 116)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 114 && relativeLocation[113] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 114)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 83 && relativeLocation[82] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 83)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 2 && relativeLocation[1] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 2)))
      return blacklistCheck(match);

  return null;
};


/**
 * Returns the module that should be used to resolve require calls. It's usually the direct parent, except if we're
 * inside an eval expression.
 */

function getIssuerModule(parent) {
  let issuer = parent;

  while (issuer && (issuer.id === '[eval]' || issuer.id === '<repl>' || !issuer.filename)) {
    issuer = issuer.parent;
  }

  return issuer;
}

/**
 * Returns information about a package in a safe way (will throw if they cannot be retrieved)
 */

function getPackageInformationSafe(packageLocator) {
  const packageInformation = exports.getPackageInformation(packageLocator);

  if (!packageInformation) {
    throw makeError(
      `INTERNAL`,
      `Couldn't find a matching entry in the dependency tree for the specified parent (this is probably an internal error)`
    );
  }

  return packageInformation;
}

/**
 * Implements the node resolution for folder access and extension selection
 */

function applyNodeExtensionResolution(unqualifiedPath, {extensions}) {
  // We use this "infinite while" so that we can restart the process as long as we hit package folders
  while (true) {
    let stat;

    try {
      stat = statSync(unqualifiedPath);
    } catch (error) {}

    // If the file exists and is a file, we can stop right there

    if (stat && !stat.isDirectory()) {
      // If the very last component of the resolved path is a symlink to a file, we then resolve it to a file. We only
      // do this first the last component, and not the rest of the path! This allows us to support the case of bin
      // symlinks, where a symlink in "/xyz/pkg-name/.bin/bin-name" will point somewhere else (like "/xyz/pkg-name/index.js").
      // In such a case, we want relative requires to be resolved relative to "/xyz/pkg-name/" rather than "/xyz/pkg-name/.bin/".
      //
      // Also note that the reason we must use readlink on the last component (instead of realpath on the whole path)
      // is that we must preserve the other symlinks, in particular those used by pnp to deambiguate packages using
      // peer dependencies. For example, "/xyz/.pnp/local/pnp-01234569/.bin/bin-name" should see its relative requires
      // be resolved relative to "/xyz/.pnp/local/pnp-0123456789/" rather than "/xyz/pkg-with-peers/", because otherwise
      // we would lose the information that would tell us what are the dependencies of pkg-with-peers relative to its
      // ancestors.

      if (lstatSync(unqualifiedPath).isSymbolicLink()) {
        unqualifiedPath = path.normalize(path.resolve(path.dirname(unqualifiedPath), readlinkSync(unqualifiedPath)));
      }

      return unqualifiedPath;
    }

    // If the file is a directory, we must check if it contains a package.json with a "main" entry

    if (stat && stat.isDirectory()) {
      let pkgJson;

      try {
        pkgJson = JSON.parse(readFileSync(`${unqualifiedPath}/package.json`, 'utf-8'));
      } catch (error) {}

      let nextUnqualifiedPath;

      if (pkgJson && pkgJson.main) {
        nextUnqualifiedPath = path.resolve(unqualifiedPath, pkgJson.main);
      }

      // If the "main" field changed the path, we start again from this new location

      if (nextUnqualifiedPath && nextUnqualifiedPath !== unqualifiedPath) {
        const resolution = applyNodeExtensionResolution(nextUnqualifiedPath, {extensions});

        if (resolution !== null) {
          return resolution;
        }
      }
    }

    // Otherwise we check if we find a file that match one of the supported extensions

    const qualifiedPath = extensions
      .map(extension => {
        return `${unqualifiedPath}${extension}`;
      })
      .find(candidateFile => {
        return existsSync(candidateFile);
      });

    if (qualifiedPath) {
      return qualifiedPath;
    }

    // Otherwise, we check if the path is a folder - in such a case, we try to use its index

    if (stat && stat.isDirectory()) {
      const indexPath = extensions
        .map(extension => {
          return `${unqualifiedPath}/index${extension}`;
        })
        .find(candidateFile => {
          return existsSync(candidateFile);
        });

      if (indexPath) {
        return indexPath;
      }
    }

    // Otherwise there's nothing else we can do :(

    return null;
  }
}

/**
 * This function creates fake modules that can be used with the _resolveFilename function.
 * Ideally it would be nice to be able to avoid this, since it causes useless allocations
 * and cannot be cached efficiently (we recompute the nodeModulePaths every time).
 *
 * Fortunately, this should only affect the fallback, and there hopefully shouldn't be a
 * lot of them.
 */

function makeFakeModule(path) {
  const fakeModule = new Module(path, false);
  fakeModule.filename = path;
  fakeModule.paths = Module._nodeModulePaths(path);
  return fakeModule;
}

/**
 * Normalize path to posix format.
 */

function normalizePath(fsPath) {
  fsPath = path.normalize(fsPath);

  if (process.platform === 'win32') {
    fsPath = fsPath.replace(backwardSlashRegExp, '/');
  }

  return fsPath;
}

/**
 * Forward the resolution to the next resolver (usually the native one)
 */

function callNativeResolution(request, issuer) {
  if (issuer.endsWith('/')) {
    issuer += 'internal.js';
  }

  try {
    enableNativeHooks = false;

    // Since we would need to create a fake module anyway (to call _resolveLookupPath that
    // would give us the paths to give to _resolveFilename), we can as well not use
    // the {paths} option at all, since it internally makes _resolveFilename create another
    // fake module anyway.
    return Module._resolveFilename(request, makeFakeModule(issuer), false);
  } finally {
    enableNativeHooks = true;
  }
}

/**
 * This key indicates which version of the standard is implemented by this resolver. The `std` key is the
 * Plug'n'Play standard, and any other key are third-party extensions. Third-party extensions are not allowed
 * to override the standard, and can only offer new methods.
 *
 * If an new version of the Plug'n'Play standard is released and some extensions conflict with newly added
 * functions, they'll just have to fix the conflicts and bump their own version number.
 */

exports.VERSIONS = {std: 1};

/**
 * Useful when used together with getPackageInformation to fetch information about the top-level package.
 */

exports.topLevel = {name: null, reference: null};

/**
 * Gets the package information for a given locator. Returns null if they cannot be retrieved.
 */

exports.getPackageInformation = function getPackageInformation({name, reference}) {
  const packageInformationStore = packageInformationStores.get(name);

  if (!packageInformationStore) {
    return null;
  }

  const packageInformation = packageInformationStore.get(reference);

  if (!packageInformation) {
    return null;
  }

  return packageInformation;
};

/**
 * Transforms a request (what's typically passed as argument to the require function) into an unqualified path.
 * This path is called "unqualified" because it only changes the package name to the package location on the disk,
 * which means that the end result still cannot be directly accessed (for example, it doesn't try to resolve the
 * file extension, or to resolve directories to their "index.js" content). Use the "resolveUnqualified" function
 * to convert them to fully-qualified paths, or just use "resolveRequest" that do both operations in one go.
 *
 * Note that it is extremely important that the `issuer` path ends with a forward slash if the issuer is to be
 * treated as a folder (ie. "/tmp/foo/" rather than "/tmp/foo" if "foo" is a directory). Otherwise relative
 * imports won't be computed correctly (they'll get resolved relative to "/tmp/" instead of "/tmp/foo/").
 */

exports.resolveToUnqualified = function resolveToUnqualified(request, issuer, {considerBuiltins = true} = {}) {
  // The 'pnpapi' request is reserved and will always return the path to the PnP file, from everywhere

  if (request === `pnpapi`) {
    return pnpFile;
  }

  // Bailout if the request is a native module

  if (considerBuiltins && builtinModules.has(request)) {
    return null;
  }

  // We allow disabling the pnp resolution for some subpaths. This is because some projects, often legacy,
  // contain multiple levels of dependencies (ie. a yarn.lock inside a subfolder of a yarn.lock). This is
  // typically solved using workspaces, but not all of them have been converted already.

  if (ignorePattern && ignorePattern.test(normalizePath(issuer))) {
    const result = callNativeResolution(request, issuer);

    if (result === false) {
      throw makeError(
        `BUILTIN_NODE_RESOLUTION_FAIL`,
        `The builtin node resolution algorithm was unable to resolve the module referenced by "${request}" and requested from "${issuer}" (it didn't go through the pnp resolver because the issuer was explicitely ignored by the regexp "null")`,
        {
          request,
          issuer,
        }
      );
    }

    return result;
  }

  let unqualifiedPath;

  // If the request is a relative or absolute path, we just return it normalized

  const dependencyNameMatch = request.match(pathRegExp);

  if (!dependencyNameMatch) {
    if (path.isAbsolute(request)) {
      unqualifiedPath = path.normalize(request);
    } else if (issuer.match(isDirRegExp)) {
      unqualifiedPath = path.normalize(path.resolve(issuer, request));
    } else {
      unqualifiedPath = path.normalize(path.resolve(path.dirname(issuer), request));
    }
  }

  // Things are more hairy if it's a package require - we then need to figure out which package is needed, and in
  // particular the exact version for the given location on the dependency tree

  if (dependencyNameMatch) {
    const [, dependencyName, subPath] = dependencyNameMatch;

    const issuerLocator = exports.findPackageLocator(issuer);

    // If the issuer file doesn't seem to be owned by a package managed through pnp, then we resort to using the next
    // resolution algorithm in the chain, usually the native Node resolution one

    if (!issuerLocator) {
      const result = callNativeResolution(request, issuer);

      if (result === false) {
        throw makeError(
          `BUILTIN_NODE_RESOLUTION_FAIL`,
          `The builtin node resolution algorithm was unable to resolve the module referenced by "${request}" and requested from "${issuer}" (it didn't go through the pnp resolver because the issuer doesn't seem to be part of the Yarn-managed dependency tree)`,
          {
            request,
            issuer,
          }
        );
      }

      return result;
    }

    const issuerInformation = getPackageInformationSafe(issuerLocator);

    // We obtain the dependency reference in regard to the package that request it

    let dependencyReference = issuerInformation.packageDependencies.get(dependencyName);

    // If we can't find it, we check if we can potentially load it from the packages that have been defined as potential fallbacks.
    // It's a bit of a hack, but it improves compatibility with the existing Node ecosystem. Hopefully we should eventually be able
    // to kill this logic and become stricter once pnp gets enough traction and the affected packages fix themselves.

    if (issuerLocator !== topLevelLocator) {
      for (let t = 0, T = fallbackLocators.length; dependencyReference === undefined && t < T; ++t) {
        const fallbackInformation = getPackageInformationSafe(fallbackLocators[t]);
        dependencyReference = fallbackInformation.packageDependencies.get(dependencyName);
      }
    }

    // If we can't find the path, and if the package making the request is the top-level, we can offer nicer error messages

    if (!dependencyReference) {
      if (dependencyReference === null) {
        if (issuerLocator === topLevelLocator) {
          throw makeError(
            `MISSING_PEER_DEPENDENCY`,
            `You seem to be requiring a peer dependency ("${dependencyName}"), but it is not installed (which might be because you're the top-level package)`,
            {request, issuer, dependencyName}
          );
        } else {
          throw makeError(
            `MISSING_PEER_DEPENDENCY`,
            `Package "${issuerLocator.name}@${issuerLocator.reference}" is trying to access a peer dependency ("${dependencyName}") that should be provided by its direct ancestor but isn't`,
            {request, issuer, issuerLocator: Object.assign({}, issuerLocator), dependencyName}
          );
        }
      } else {
        if (issuerLocator === topLevelLocator) {
          throw makeError(
            `UNDECLARED_DEPENDENCY`,
            `You cannot require a package ("${dependencyName}") that is not declared in your dependencies (via "${issuer}")`,
            {request, issuer, dependencyName}
          );
        } else {
          const candidates = Array.from(issuerInformation.packageDependencies.keys());
          throw makeError(
            `UNDECLARED_DEPENDENCY`,
            `Package "${issuerLocator.name}@${issuerLocator.reference}" (via "${issuer}") is trying to require the package "${dependencyName}" (via "${request}") without it being listed in its dependencies (${candidates.join(
              `, `
            )})`,
            {request, issuer, issuerLocator: Object.assign({}, issuerLocator), dependencyName, candidates}
          );
        }
      }
    }

    // We need to check that the package exists on the filesystem, because it might not have been installed

    const dependencyLocator = {name: dependencyName, reference: dependencyReference};
    const dependencyInformation = exports.getPackageInformation(dependencyLocator);
    const dependencyLocation = path.resolve(__dirname, dependencyInformation.packageLocation);

    if (!dependencyLocation) {
      throw makeError(
        `MISSING_DEPENDENCY`,
        `Package "${dependencyLocator.name}@${dependencyLocator.reference}" is a valid dependency, but hasn't been installed and thus cannot be required (it might be caused if you install a partial tree, such as on production environments)`,
        {request, issuer, dependencyLocator: Object.assign({}, dependencyLocator)}
      );
    }

    // Now that we know which package we should resolve to, we only have to find out the file location

    if (subPath) {
      unqualifiedPath = path.resolve(dependencyLocation, subPath);
    } else {
      unqualifiedPath = dependencyLocation;
    }
  }

  return path.normalize(unqualifiedPath);
};

/**
 * Transforms an unqualified path into a qualified path by using the Node resolution algorithm (which automatically
 * appends ".js" / ".json", and transforms directory accesses into "index.js").
 */

exports.resolveUnqualified = function resolveUnqualified(
  unqualifiedPath,
  {extensions = Object.keys(Module._extensions)} = {}
) {
  const qualifiedPath = applyNodeExtensionResolution(unqualifiedPath, {extensions});

  if (qualifiedPath) {
    return path.normalize(qualifiedPath);
  } else {
    throw makeError(
      `QUALIFIED_PATH_RESOLUTION_FAILED`,
      `Couldn't find a suitable Node resolution for unqualified path "${unqualifiedPath}"`,
      {unqualifiedPath}
    );
  }
};

/**
 * Transforms a request into a fully qualified path.
 *
 * Note that it is extremely important that the `issuer` path ends with a forward slash if the issuer is to be
 * treated as a folder (ie. "/tmp/foo/" rather than "/tmp/foo" if "foo" is a directory). Otherwise relative
 * imports won't be computed correctly (they'll get resolved relative to "/tmp/" instead of "/tmp/foo/").
 */

exports.resolveRequest = function resolveRequest(request, issuer, {considerBuiltins, extensions} = {}) {
  let unqualifiedPath;

  try {
    unqualifiedPath = exports.resolveToUnqualified(request, issuer, {considerBuiltins});
  } catch (originalError) {
    // If we get a BUILTIN_NODE_RESOLUTION_FAIL error there, it means that we've had to use the builtin node
    // resolution, which usually shouldn't happen. It might be because the user is trying to require something
    // from a path loaded through a symlink (which is not possible, because we need something normalized to
    // figure out which package is making the require call), so we try to make the same request using a fully
    // resolved issuer and throws a better and more actionable error if it works.
    if (originalError.code === `BUILTIN_NODE_RESOLUTION_FAIL`) {
      let realIssuer;

      try {
        realIssuer = realpathSync(issuer);
      } catch (error) {}

      if (realIssuer) {
        if (issuer.endsWith(`/`)) {
          realIssuer = realIssuer.replace(/\/?$/, `/`);
        }

        try {
          exports.resolveToUnqualified(request, realIssuer, {considerBuiltins});
        } catch (error) {
          // If an error was thrown, the problem doesn't seem to come from a path not being normalized, so we
          // can just throw the original error which was legit.
          throw originalError;
        }

        // If we reach this stage, it means that resolveToUnqualified didn't fail when using the fully resolved
        // file path, which is very likely caused by a module being invoked through Node with a path not being
        // correctly normalized (ie you should use "node $(realpath script.js)" instead of "node script.js").
        throw makeError(
          `SYMLINKED_PATH_DETECTED`,
          `A pnp module ("${request}") has been required from what seems to be a symlinked path ("${issuer}"). This is not possible, you must ensure that your modules are invoked through their fully resolved path on the filesystem (in this case "${realIssuer}").`,
          {
            request,
            issuer,
            realIssuer,
          }
        );
      }
    }
    throw originalError;
  }

  if (unqualifiedPath === null) {
    return null;
  }

  try {
    return exports.resolveUnqualified(unqualifiedPath, {extensions});
  } catch (resolutionError) {
    if (resolutionError.code === 'QUALIFIED_PATH_RESOLUTION_FAILED') {
      Object.assign(resolutionError.data, {request, issuer});
    }
    throw resolutionError;
  }
};

/**
 * Setups the hook into the Node environment.
 *
 * From this point on, any call to `require()` will go through the "resolveRequest" function, and the result will
 * be used as path of the file to load.
 */

exports.setup = function setup() {
  // A small note: we don't replace the cache here (and instead use the native one). This is an effort to not
  // break code similar to "delete require.cache[require.resolve(FOO)]", where FOO is a package located outside
  // of the Yarn dependency tree. In this case, we defer the load to the native loader. If we were to replace the
  // cache by our own, the native loader would populate its own cache, which wouldn't be exposed anymore, so the
  // delete call would be broken.

  const originalModuleLoad = Module._load;

  Module._load = function(request, parent, isMain) {
    if (!enableNativeHooks) {
      return originalModuleLoad.call(Module, request, parent, isMain);
    }

    // Builtins are managed by the regular Node loader

    if (builtinModules.has(request)) {
      try {
        enableNativeHooks = false;
        return originalModuleLoad.call(Module, request, parent, isMain);
      } finally {
        enableNativeHooks = true;
      }
    }

    // The 'pnpapi' name is reserved to return the PnP api currently in use by the program

    if (request === `pnpapi`) {
      return pnpModule.exports;
    }

    // Request `Module._resolveFilename` (ie. `resolveRequest`) to tell us which file we should load

    const modulePath = Module._resolveFilename(request, parent, isMain);

    // Check if the module has already been created for the given file

    const cacheEntry = Module._cache[modulePath];

    if (cacheEntry) {
      return cacheEntry.exports;
    }

    // Create a new module and store it into the cache

    const module = new Module(modulePath, parent);
    Module._cache[modulePath] = module;

    // The main module is exposed as global variable

    if (isMain) {
      process.mainModule = module;
      module.id = '.';
    }

    // Try to load the module, and remove it from the cache if it fails

    let hasThrown = true;

    try {
      module.load(modulePath);
      hasThrown = false;
    } finally {
      if (hasThrown) {
        delete Module._cache[modulePath];
      }
    }

    // Some modules might have to be patched for compatibility purposes

    for (const [filter, patchFn] of patchedModules) {
      if (filter.test(request)) {
        module.exports = patchFn(exports.findPackageLocator(parent.filename), module.exports);
      }
    }

    return module.exports;
  };

  const originalModuleResolveFilename = Module._resolveFilename;

  Module._resolveFilename = function(request, parent, isMain, options) {
    if (!enableNativeHooks) {
      return originalModuleResolveFilename.call(Module, request, parent, isMain, options);
    }

    let issuers;

    if (options) {
      const optionNames = new Set(Object.keys(options));
      optionNames.delete('paths');

      if (optionNames.size > 0) {
        throw makeError(
          `UNSUPPORTED`,
          `Some options passed to require() aren't supported by PnP yet (${Array.from(optionNames).join(', ')})`
        );
      }

      if (options.paths) {
        issuers = options.paths.map(entry => `${path.normalize(entry)}/`);
      }
    }

    if (!issuers) {
      const issuerModule = getIssuerModule(parent);
      const issuer = issuerModule ? issuerModule.filename : `${process.cwd()}/`;

      issuers = [issuer];
    }

    let firstError;

    for (const issuer of issuers) {
      let resolution;

      try {
        resolution = exports.resolveRequest(request, issuer);
      } catch (error) {
        firstError = firstError || error;
        continue;
      }

      return resolution !== null ? resolution : request;
    }

    throw firstError;
  };

  const originalFindPath = Module._findPath;

  Module._findPath = function(request, paths, isMain) {
    if (!enableNativeHooks) {
      return originalFindPath.call(Module, request, paths, isMain);
    }

    for (const path of paths || []) {
      let resolution;

      try {
        resolution = exports.resolveRequest(request, path);
      } catch (error) {
        continue;
      }

      if (resolution) {
        return resolution;
      }
    }

    return false;
  };

  process.versions.pnp = String(exports.VERSIONS.std);
};

exports.setupCompatibilityLayer = () => {
  // ESLint currently doesn't have any portable way for shared configs to specify their own
  // plugins that should be used (https://github.com/eslint/eslint/issues/10125). This will
  // likely get fixed at some point, but it'll take time and in the meantime we'll just add
  // additional fallback entries for common shared configs.

  for (const name of [`react-scripts`]) {
    const packageInformationStore = packageInformationStores.get(name);
    if (packageInformationStore) {
      for (const reference of packageInformationStore.keys()) {
        fallbackLocators.push({name, reference});
      }
    }
  }

  // Modern versions of `resolve` support a specific entry point that custom resolvers can use
  // to inject a specific resolution logic without having to patch the whole package.
  //
  // Cf: https://github.com/browserify/resolve/pull/174

  patchedModules.push([
    /^\.\/normalize-options\.js$/,
    (issuer, normalizeOptions) => {
      if (!issuer || issuer.name !== 'resolve') {
        return normalizeOptions;
      }

      return (request, opts) => {
        opts = opts || {};

        if (opts.forceNodeResolution) {
          return opts;
        }

        opts.preserveSymlinks = true;
        opts.paths = function(request, basedir, getNodeModulesDir, opts) {
          // Extract the name of the package being requested (1=full name, 2=scope name, 3=local name)
          const parts = request.match(/^((?:(@[^\/]+)\/)?([^\/]+))/);

          // make sure that basedir ends with a slash
          if (basedir.charAt(basedir.length - 1) !== '/') {
            basedir = path.join(basedir, '/');
          }
          // This is guaranteed to return the path to the "package.json" file from the given package
          const manifestPath = exports.resolveToUnqualified(`${parts[1]}/package.json`, basedir);

          // The first dirname strips the package.json, the second strips the local named folder
          let nodeModules = path.dirname(path.dirname(manifestPath));

          // Strips the scope named folder if needed
          if (parts[2]) {
            nodeModules = path.dirname(nodeModules);
          }

          return [nodeModules];
        };

        return opts;
      };
    },
  ]);
};

if (module.parent && module.parent.id === 'internal/preload') {
  exports.setupCompatibilityLayer();

  exports.setup();
}

if (process.mainModule === module) {
  exports.setupCompatibilityLayer();

  const reportError = (code, message, data) => {
    process.stdout.write(`${JSON.stringify([{code, message, data}, null])}\n`);
  };

  const reportSuccess = resolution => {
    process.stdout.write(`${JSON.stringify([null, resolution])}\n`);
  };

  const processResolution = (request, issuer) => {
    try {
      reportSuccess(exports.resolveRequest(request, issuer));
    } catch (error) {
      reportError(error.code, error.message, error.data);
    }
  };

  const processRequest = data => {
    try {
      const [request, issuer] = JSON.parse(data);
      processResolution(request, issuer);
    } catch (error) {
      reportError(`INVALID_JSON`, error.message, error.data);
    }
  };

  if (process.argv.length > 2) {
    if (process.argv.length !== 4) {
      process.stderr.write(`Usage: ${process.argv[0]} ${process.argv[1]} <request> <issuer>\n`);
      process.exitCode = 64; /* EX_USAGE */
    } else {
      processResolution(process.argv[2], process.argv[3]);
    }
  } else {
    let buffer = '';
    const decoder = new StringDecoder.StringDecoder();

    process.stdin.on('data', chunk => {
      buffer += decoder.write(chunk);

      do {
        const index = buffer.indexOf('\n');
        if (index === -1) {
          break;
        }

        const line = buffer.slice(0, index);
        buffer = buffer.slice(index + 1);

        processRequest(line);
      } while (true);
    });
  }
}
