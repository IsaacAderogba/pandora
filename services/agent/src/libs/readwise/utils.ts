import { Highlight } from "./types";

export const sortHighlights = (highlights: Highlight[]) => {
  return highlights.sort((a, b) => {
    const aLocation = a["location"];
    const bLocation = b["location"];

    if (
      typeof aLocation === "number" &&
      typeof bLocation === "number" &&
      aLocation !== bLocation
    ) {
      return aLocation - bLocation;
    }

    return new Date(a.highlighted_at).getTime() - new Date(b.highlighted_at).getTime();
  });
};
