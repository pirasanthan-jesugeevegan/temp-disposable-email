export const generateRandomName = (): string =>
  Math.random().toString(36).substring(2, 15);
