import { exec } from "child_process";
import { promisify } from "util";

/**
 * Runs a shell command and gives the output
 * @param command The shell command to run
 * @returns The stdout and stderr of the shell command
 */
export async function shell(command: string): Promise<{
  stdout: string;
  stderr: string;
}> {
  return await promisify(exec)(command);
}
