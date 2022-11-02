import removeMd from "remove-markdown";

export const truncate = (str: string, length: number) => {
  const standardizedLength = length - 5;
  if (str.length >= standardizedLength) {
    return str.slice(0, standardizedLength) + "...";
  }

  return str;
};

export const capitallize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const stripMarkdown = (str: string) => {
  return removeMd(str);
};
