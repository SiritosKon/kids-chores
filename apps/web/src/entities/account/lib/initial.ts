export const nameInitial = (name: string): string => (Array.from(name.trim())[0] ?? '').toLocaleUpperCase();
