import Link from "next/link";

export default function NotFound() {
  return (
    <div data-vaul-drawer-wrapper>
      <main className="notfound-main shared-module__q8HX2G__baseTypography site-main">
        <section className="notfound-shell">
          <h1 className="notfound-title">This page does not exist.</h1>
          <p className="notfound-copy">
            Johan has probably eaten it... Try going back to the homepage and clicking a different link!
          </p>
          <div className="notfound-actions">
            <Link href="/" className="notfound-link">
              Go to home
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
