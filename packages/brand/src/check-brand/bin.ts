#!/usr/bin/env node
// The check-brand command, run from the built dist/ with plain Node.
import { runCli } from "./cli.js";

process.exitCode = runCli(process.argv.slice(2));
