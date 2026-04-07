import type { ReactNode } from "react";

type Props = { title: string; children: ReactNode };

export function FormSection({ title, children }: Props) {
  const slug = title.toLowerCase().replace(/\s+/g, "-");
  return (
    <section className="formSection" data-section={slug}>
      <h2 className="formSectionTitle">{title}</h2>
      <div className="formSectionCard">{children}</div>
    </section>
  );
}
