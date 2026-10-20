#!/usr/bin/env tsx
// The check-brand command. Node does not strip types from files under
// node_modules, so the shebang asks for tsx (a dev dependency of the product).
import { runCli } from "./cli.js";

process.exitCode = runCli(process.argv.slice(2));
