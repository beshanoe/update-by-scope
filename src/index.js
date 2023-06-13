const Path = require("path");
const fs = require("fs");
const ChildProcess = require("child_process");
const args = require("args");
const hasYarn = require("has-yarn");
const os = require("os");
const semver = require("semver");

const [defaultNpmClient, defaultNpmCommand] = hasYarn()
  ? ["yarn", "upgrade"]
  : ["npm", "install"];

args
  .option(["n", "npmClient"], "NPM client", defaultNpmClient)
  .option(
    ["c", "npmClientCommand"],
    "NPM client command to execute",
    defaultNpmCommand
  )
  .option(["t", "tag"], "NPM tag. Will default to 'latest' or a package's specified prerelease tag unless explicitly set.")
  .option("v", "Show version")
  .option(["h", "help"], "Show help");

const flags = args.parse(process.argv, {
  value: `<scope> [npmClient=${defaultNpmClient}] [npmClientCommand=${defaultNpmCommand}]`,
  help: false,
  version: false
});

if (flags.h) {
  args.showHelp();
}
if (flags.v) {
  console.log(require('../package.json').version)
  process.exit(0)
}

const [
  scope,
  legacyNpmClient = defaultNpmClient,
  legacyClientCommand = defaultNpmCommand
] = args.sub;

const npmClient = flags.npmClient || legacyNpmClient;
const clientCommand = flags.npmClientCommand || legacyClientCommand;

if (!scope) {
  args.showHelp();
}

const { dependencies = {}, devDependencies = {} } = JSON.parse(
  fs.readFileSync(Path.join(process.cwd(), "./package.json"))
);

const packages = Array.from(
  new Set(
    [...Object.entries(dependencies), ...Object.entries(devDependencies)].filter(([_]) =>
      _.startsWith(scope)
    )
  )
).sort();

if (!packages.length) {
  console.log(`Found 0 packages with scope "${scope}"`);
  return;
}

const packageNamesWithVersion = packages.map(([package, version]) => {
  let tag = flags.tag;

  if (!tag) {
    // Get the minimum version for the package using semver (e.g. ^1.0.0 -> 1.0.0)
    const minVersionForPackageSemver = semver.minVersion(version);
    
    // If a prerelease tag was found, use it as the tag
    if (minVersionForPackageSemver && typeof minVersionForPackageSemver.prerelease[0] === 'string') {
      tag = minVersionForPackageSemver.prerelease[0];
    }

    // If no prerelease tag was found, default to latest
    if (!tag) {
      tag = 'latest';
    }
  }

  return `${package}@${tag}`;
});

const packageNames = packages.map(([package]) => package);

console.log(`Found ${packageNames.length} with scope "${scope}":`);
console.log(packageNames);
console.log(
  `Executing "${npmClient} ${clientCommand} ${packageNamesWithVersion.join(
    " "
  )}"`
);

ChildProcess.spawnSync(npmClient, [clientCommand, ...packageNamesWithVersion], {
  stdio: "inherit",
  shell: os.platform() == 'win32'
});
