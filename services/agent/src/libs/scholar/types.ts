export interface Paper {
  paperId: string;
  externalIds: {
    ArXiv: string;
    DBLP: string;
    PubMedCentral: string;
  };
  url: string;
  title: string;
  abstract: string;
  venue: string;
  year: number;
  referenceCount: number;
  citationCount: number;
  influentialCitationCount: number;
  isOpenAccess: boolean;
  openAccessPdf: {
    url: string;
    status: string;
  };
  fieldsOfStudy: string[];
  publicationTypes: string[];
  publicationDate: string;
  journal: {
    name: string;
    pages: string;
    volume: string;
  };
  authors: { authorId: string; name: string }[];
  tldr: {
    model: string;
    text: string;
  };
}
