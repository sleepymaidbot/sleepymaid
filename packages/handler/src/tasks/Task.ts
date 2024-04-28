import type { HandlerClient } from "../HandlerClient";

export interface TaskInterface {
	interval: string;
	execute: (client: HandlerClient) => unknown | Promise<unknown>;
}
