export const delay = (ms = 0): Promise<NodeJS.Timeout> =>
  new Promise((resolve) => setTimeout(resolve, ms));
