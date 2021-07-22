const path = require("path");
const fs = require("fs-extra"); // fs-extra is an explicity installed npm package.
const solc = require("solc"); // solc is the solidity compiler and an explicity installed npm package.

// Remove build directory.
const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath);

// Read source file.
const sourcePath = path.resolve(__dirname, "contracts", "Campaign.sol");
const source = fs.readFileSync(sourcePath, "utf8");

// // Compile all contracts and assign to output. version solc@0.4.17.
const output = solc.compile(source, 1).contracts;

// // Create build directory.
fs.ensureDirSync(buildPath);

// Loop through all compiled contracts in output.
for (let contract in output) {
  fs.outputJsonSync(
    path.resolve(buildPath, contract.replace(":", "") + ".json"),
    output[contract]
  );
}
