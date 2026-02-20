import { redirect } from "next/navigation";

type SearchParams = Record<string, string | string[] | undefined>;

export default function VoidPage({ searchParams }: { searchParams?: SearchParams }) {
  const params = new URLSearchParams();

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (key === "tab") {
        continue;
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          params.append(key, item);
        }
      } else if (typeof value === "string") {
        params.set(key, value);
      }
    }
  }

  params.set("tab", "void");
  redirect(`/?${params.toString()}`);
}
