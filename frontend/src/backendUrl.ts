const viteEnvironment = (import.meta as unknown as {
	env?: { VITE_BACKEND_URL?: string };
}).env;
const configuredBackendUrl = viteEnvironment?.VITE_BACKEND_URL;

export const backendUrl = (configuredBackendUrl || "https://lost-lol.onrender.com").replace(/\/+$/, "");
