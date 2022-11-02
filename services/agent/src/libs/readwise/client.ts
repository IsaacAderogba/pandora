import axios from "axios";
import { rateLimit, rateLimiter } from "../limiter";
import {
  Book,
  BookListParameters,
  ExportedBook,
  ExportParameters,
  ExportResult,
  PaginationResult,
} from "./types";

@rateLimiter({ duration: 5000, points: 1 })
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

  async exportListAll(
    params: Partial<ExportParameters> = {}
  ): Promise<ExportedBook[]> {
    const results: ExportedBook[] = [];
    let pageCursor: string | null | undefined;

    do {
      const result = await this.exportList({
        ...params,
        pageCursor: pageCursor ?? undefined,
      });
      results.push(...result.results);
      pageCursor = result.nextPageCursor;
    } while (pageCursor);

    return results;
  }

  @rateLimit({ points: 1 })
  async exportList(
    params: Partial<ExportParameters> = {}
  ): Promise<ExportResult> {
    const { data } = await this.client.get<ExportResult>(`/export`, {
      params,
    });

    return data;
  }
}

export const readwise = new Readwise();
