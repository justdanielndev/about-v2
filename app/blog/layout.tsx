import TopBar from "./_components/top-bar";
import styles from "./blog.module.css";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-vaul-drawer-wrapper className={styles.blogShell}>
      <main className={`shared-module__q8HX2G__baseTypography site-main ${styles.blogMain}`}>
        <TopBar active="blog" />
        {children}
      </main>
    </div>
  );
}
