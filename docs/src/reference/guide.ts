import { getCollection } from "astro:content";

let titles: Promise<Map<string, string>> | undefined;

/** The title of a page of the guide ("/data/str/") in a language, or nothing when the page does not exist. */
export async function guideTitle(path: string, locale: string | undefined): Promise<string | undefined> {
  titles ??= getCollection("docs").then((entries) => new Map(entries.map((entry) => [entry.id, entry.data.title])));
  const id = path.replace(/^\/|\/$/g, "");
  const all = await titles;
  return (locale && all.get(`${locale}/${id}`)) || all.get(id);
}
