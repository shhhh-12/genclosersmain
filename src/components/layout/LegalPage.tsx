import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { Txt } from "@/components/ui/Text";

/** Simple reading page for legal text. Body comes from /src/content/legal.ts. */
export function LegalPage({ title, body }: { title: string; body: string[] }) {
  return (
    <>
      <SiteHeader />
      <main className="on-paper px-(--gutter) pt-40 pb-(--section-y)">
        <article className="mx-auto max-w-(--container-prose)">
          <h1 className="font-display text-h2 font-semibold tracking-[-0.03em]">{title}</h1>
          <div className="mt-10 space-y-5 text-mute-light">
            {body.map((p, i) => (
              <p key={i}>
                <Txt>{p}</Txt>
              </p>
            ))}
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
