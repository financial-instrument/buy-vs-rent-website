import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <article className="prose prose-sm dark:prose-invert mx-auto max-w-3xl py-16 text-center">
      <p className="text-6xl font-bold leading-none tracking-tighter">404</p>
      <h1 className="mt-4">Page not found</h1>
      <p className="text-muted-foreground">
        The page you're looking for doesn't exist — or never did.
      </p>
      <div className="not-prose mt-8 flex flex-wrap justify-center gap-3 text-sm">
        <Link href="/" className="underline-offset-4 hover:underline">
          Home
        </Link>
        <span className="text-muted-foreground">·</span>
        <Link href="/us" className="underline-offset-4 hover:underline">
          🇺🇸 US calculator
        </Link>
        <span className="text-muted-foreground">·</span>
        <Link href="/nl" className="underline-offset-4 hover:underline">
          🇳🇱 NL calculator
        </Link>
        <span className="text-muted-foreground">·</span>
        <Link href="/it" className="underline-offset-4 hover:underline">
          🇮🇹 IT calculator
        </Link>
      </div>
    </article>
  );
}
