import axios from "axios";
import { rateLimit, rateLimiter } from "../limiter";
import { Book, BookListParameters, PaginationResult } from "./types";

@rateLimiter({ duration: 3000, points: 1 })
class Readwise {
  client = axios.create({
    headers: {
      "Content-Type": "application/json",
      authorization: `Token ${process.env.READWISE_SECRET}`,
    },
    baseURL: "https://readwise.io/api/v2",
  });

  @rateLimit({ points: 1 })
  async bookList(
    params: Partial<BookListParameters> = {}
  ): Promise<PaginationResult<Book>> {
    const { data } = await this.client.get<PaginationResult<Book>>(`/books`, {
      params,
    });

    return data;
  }
}

export const readwise = new Readwise();

/**
 * Endpoints to focus on:
 * bookList
 * bookTagsList
 *
 * highlightExport
 * highlightList
 * highlightTagsList
 *
 */
