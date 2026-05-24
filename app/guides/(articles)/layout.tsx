import Link from "next/link";

export default function GuideArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl py-6">
      <Link
        href="/guides"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← All guides
      </Link>
      <article className="prose prose-sm dark:prose-invert mt-4 max-w-none prose-headings:scroll-mt-20">
        {children}
      </article>
      <p className="mt-10 border-t pt-4 text-xs text-muted-foreground">
        Educational content, not financial or tax advice. Tax parameters reflect
        rules current at the time of writing and change frequently, so verify against
        official sources before acting. See the{" "}
        <Link href="/methodology" className="underline">
          methodology
        </Link>{" "}
        for how the calculator implements these rules.
      </p>
    </div>
  );
}
