import type { ReactNode } from "react";

type Props = { title: string; children: ReactNode; headerExtra?: ReactNode };

export function FormSection({ title, children, headerExtra }: Props) {
  const slug = title.toLowerCase().replace(/\s+/g, "-");
  return (
    <section className="formSection" data-section={slug}>
      <div className="formSectionHeading">
        <h2 className="formSectionTitle">{title}</h2>
        {headerExtra}
      </div>
      <div className="formSectionCard">{children}</div>
    </section>
  );
}
