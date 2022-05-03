/// <reference types="cheerio" />
/// <reference types="jquery" />

export interface ScrapeOptions {
  [key: string]: string | ScrapeOptionList | ScrapeOptionElement;
}

export interface ScrapeOptionElement {
  selector?: string;
  convert?: (value: any) => any;
  how?: string | ((element: cheerio.Cheerio) => any);
  attr?: string;
  trim?: boolean;
  closest?: string;
  eq?: number;
  texteq?: number;
}

export interface ScrapeOptionList {
  listItem: string;
  data?: ScrapeOptions;
  convert?: (value: any) => any;
}

export default function scrapeHTML<T>(
  body: string | cheerio.Root | JQuery<HTMLElement>,
  options: ScrapeOptions
): T;