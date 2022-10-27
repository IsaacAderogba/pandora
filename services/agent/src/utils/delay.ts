export const delay = (ms = 1): Promise<NodeJS.Timeout> =>
  new Promise((resolve) => {
    const timeout = setTimeout(() => {
      clearTimeout(timeout);
      resolve(timeout);
    }, Math.max(ms, 1));
  });
