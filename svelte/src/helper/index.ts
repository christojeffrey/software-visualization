// debugging purpose
export function debuggingConsole(...args: never[]) {
	if (import.meta.env.VITE_DEBUGGING_MODE === 'true') {
		console.log(...args);
	}
}
