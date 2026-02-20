import { redirect } from "next/navigation";

type SearchParams = Record<string, string | string[] | undefined>;

export default function ProjectRedirectPage({
  params,
  searchParams
}: {
  params: { projectid: string };
  searchParams?: SearchParams;
}) {
  const query = new URLSearchParams();
  const resolvedSearch = searchParams ?? {};

  for (const [key, value] of Object.entries(resolvedSearch)) {
    if (key === "project" || key === "tab") {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        query.append(key, item);
      }
    } else if (typeof value === "string") {
      query.set(key, value);
    }
  }

  query.set("project", params.projectid);
  redirect(`/?${query.toString()}`);
}

