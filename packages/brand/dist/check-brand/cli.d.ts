import { type CheckBrandOptions } from "./check-brand.js";
export declare const USAGE: string;
export interface CliOutput {
    log(message: string): void;
    error(message: string): void;
}
/** Options of `checkBrand` from command-line arguments. */
export declare function parseCliArgs(argv: readonly string[], cwd?: string): CheckBrandOptions | "help";
/** Runs the check for `argv`; returns the exit status. */
export declare function runCli(argv: readonly string[], output?: CliOutput, cwd?: string): number;
