import lodash from "lodash";
import removeMd from "remove-markdown";

export const truncate = (str: string, length: number) => {
  const standardizedLength = length - 5;
  if (str.length >= standardizedLength) {
    return str.slice(0, standardizedLength) + "...";
  }

  return str;
};

export const startCase = (str: string) => lodash.startCase(str);

export const capitallize = (str: string) => lodash.capitalize(str);

export const stripMarkdown = (str: string) => {
  return removeMd(str);
};

export const removeTrailingDot = (str: string) => {
  if (str[str.length - 1] === ".") str = str.slice(0, -1);
  return str;
};
