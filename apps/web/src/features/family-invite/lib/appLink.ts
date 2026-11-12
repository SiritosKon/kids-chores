export const appLink = (): string => new URL(import.meta.env.BASE_URL, window.location.origin).href;
