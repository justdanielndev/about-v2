import Home from "@/components/home";
import { getBlogEntries } from "@/lib/blog";

export default async function RootPage() {
  const blogEntries = await getBlogEntries();

  return <Home blogEntries={blogEntries} />;
}
