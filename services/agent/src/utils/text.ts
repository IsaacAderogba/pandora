export const truncate = (str: string, length: number) => {
  const standardizedLength = length - 5;
  if (str.length >= standardizedLength) {
    return str.slice(0, standardizedLength) + "...";
  }

  return str;
};
