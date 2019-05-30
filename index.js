const [
  scope,
  npmClient = "yarn",
  clientCommand = "upgrade"
] = process.argv.slice(2);

if (!scope) {
  console.log(
    "Usage: update-by-scope <scope> [npmClient=yarn] [npmClientCommand=upgrade]"
  );
  return;
}
if (scope[0] !== "@") {
  console.error(`Scope should start with "@"`);
  return;
}

const { dependencies = {}, devDependencies = {} } = require("./package.json");

const packageNames = Array.from(
  new Set(
    [...Object.keys(dependencies), ...Object.keys(devDependencies)].filter(_ =>
      _.startsWith(scope)
    )
  )
).sort();

if (!packageNames.length) {
  console.log(`Found 0 packages with scope "${scope}"`);
  return;
}

const packageNamesWithVersion = packageNames.map(_ => `${_}@latest`);

console.log(`Found ${packageNames.length} with scope "${scope}":`);
console.log(packageNames);
console.log(
  `Executing "${npmClient} ${clientCommand} ${packageNamesWithVersion.join(
    " "
  )}"`
);

require("child_process").spawnSync(
  "yarn",
  [clientCommand, ...packageNamesWithVersion],
  {
    stdio: "inherit"
  }
);
