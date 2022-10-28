export function rejectAfterTimeout<T>(
  promise: Promise<T>,
  timeoutMS: number
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error("Promise has timed out"));
    }, timeoutMS);

    promise
      .then(resolve)
      .catch(reject)
      .then(() => clearTimeout(timeoutId));
  });
}
