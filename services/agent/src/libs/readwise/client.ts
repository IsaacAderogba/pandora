import axios from "axios";
import { rateLimit, rateLimiter } from "../limiter";
import {
  Book,
  BookListParameters,
  ExportedBook,
  ExportParameters,
  ExportResult,
  Highlight,
  HighlightListParameters,
  PaginationResult,
} from "./types";

@rateLimiter({ duration: 3000, points: 1 })
class Readwise {
  baseURL = "https://readwise.io/api/v2";
  client = axios.create({
    headers: {
      "Content-Type": "application/json",
      authorization: `Token ${process.env.READWISE_SECRET}`,
    },
  });

  async bookListAll(
    params: Partial<HighlightListParameters> = {}
  ): Promise<Book[]> {
    return this.listAll((url) => this.bookList({ ...params, url }));
  }

  @rateLimit({ points: 1 })
  async bookList({
    url = `${this.baseURL}/books`,
    page_size = 1000,
    ...params
  }: Partial<BookListParameters> = {}): Promise<PaginationResult<Book>> {
    const { data } = await this.client.get<PaginationResult<Book>>(url, {
      params: { page_size, ...params },
    });

    return data;
  }

  async highlightListAll(
    params: Partial<HighlightListParameters> = {}
  ): Promise<Highlight[]> {
    return this.listAll((url) => this.highlightList({ ...params, url }));
  }

  @rateLimit({ points: 1 })
  async highlightList({
    url = `${this.baseURL}/highlights`,
    page_size = 1000,
    ...params
  }: Partial<HighlightListParameters> = {}): Promise<
    PaginationResult<Highlight>
  > {
    const { data } = await this.client.get<PaginationResult<Highlight>>(url, {
      params: { page_size, ...params },
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
    const { data } = await this.client.get<ExportResult>(
      `${this.baseURL}/export`,
      {
        params,
      }
    );

    return data;
  }

  private async listAll<T>(
    loadMore: (cursor: string | undefined) => Promise<PaginationResult<T>>
  ) {
    const documents: T[] = [];
    let nextUrl: string | undefined | null;

    do {
      const result = await loadMore(nextUrl ?? undefined);
      documents.push(...result.results);
      nextUrl = result.next;
    } while (nextUrl);

    return documents;
  }
}

export const readwise = new Readwise();
