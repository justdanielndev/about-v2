const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "em",
  "code",
  "pre",
  "blockquote",
  "ul",
  "ol",
  "li",
  "a",
  "h3",
  "h4"
]);

const DROP_TAGS = new Set(["script", "style", "iframe", "object", "embed", "link", "meta"]);

function isSafeHref(href: string): boolean {
  const value = href.trim().toLowerCase();
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("mailto:") ||
    value.startsWith("/") ||
    value.startsWith("#")
  );
}

export function sanitizeProjectHtml(input: string): string {
  if (typeof document === "undefined") {
    return input;
  }

  const template = document.createElement("template");
  template.innerHTML = input;

  const walk = (node: Node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    if (DROP_TAGS.has(tag)) {
      el.remove();
      return;
    }

    if (!ALLOWED_TAGS.has(tag)) {
      const parent = el.parentNode;
      if (!parent) {
        return;
      }
      while (el.firstChild) {
        parent.insertBefore(el.firstChild, el);
      }
      parent.removeChild(el);
      return;
    }

    for (const attr of Array.from(el.attributes)) {
      const attrName = attr.name.toLowerCase();
      if (attrName.startsWith("on") || attrName === "style" || attrName === "srcdoc") {
        el.removeAttribute(attr.name);
      }
    }

    if (tag === "a") {
      const href = el.getAttribute("href");
      if (!href || !isSafeHref(href)) {
        el.removeAttribute("href");
      }

      if (el.getAttribute("target") === "_blank") {
        el.setAttribute("rel", "noopener noreferrer");
      } else {
        el.removeAttribute("target");
        el.removeAttribute("rel");
      }
    } else {
      for (const attr of Array.from(el.attributes)) {
        el.removeAttribute(attr.name);
      }
    }

    for (const child of Array.from(el.childNodes)) {
      walk(child);
    }
  };

  for (const child of Array.from(template.content.childNodes)) {
    walk(child);
  }

  return template.innerHTML;
}

