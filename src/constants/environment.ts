const runtimeConfig = (window as any).runtimeConfig || {};

export const SPARROW_LAUNCH_URL = runtimeConfig.VITE_SPARROW_LAUNCH_URL ?? import.meta.env.VITE_SPARROW_LAUNCH_URL;
export const API_BASE_URL = runtimeConfig.VITE_API_BASE_URL ?? import.meta.env.VITE_API_BASE_URL;
export const LOGIN_REDIRECT_URL = runtimeConfig.VITE_LOGIN_REDIRECT ?? import.meta.env.VITE_LOGIN_REDIRECT;
export const SPARROW_DOCS_URL = runtimeConfig.VITE_SPARROW_DOCS_URL ?? import.meta.env.VITE_SPARROW_DOCS_URL;
export const APP_ENVIRONMENT = runtimeConfig.VITE_ENVIRONMENT ?? import.meta.env.VITE_ENVIRONMENT;
export const POSTHOG_API_KEY = runtimeConfig.VITE_POSTHOG_CONNECTION_API_KEY ?? import.meta.env.VITE_POSTHOG_CONNECTION_API_KEY;
export const APP_EDITION = runtimeConfig.VITE_APP_EDITION ?? import.meta.env.VITE_APP_EDITION;
export const SPARROW_MARKETING_URL = runtimeConfig.VITE_SPARROW_MARKETING_URL ?? import.meta.env.VITE_SPARROW_MARKETING_URL;