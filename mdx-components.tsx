import type { MDXComponents } from "mdx/types";

// Required by @next/mdx in the App Router. Styling for guide prose is applied
// by app/guides/layout.tsx (Tailwind Typography `prose`), so this map only
// needs to cover element-level tweaks we want everywhere MDX is rendered.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
  };
}
