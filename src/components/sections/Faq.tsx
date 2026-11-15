import { faq } from "@content/faq";
import { Accordion, Section } from "@/components/ui";

export function Faq() {
  return (
    <Section
      id="faq"
      eyebrow="FAQ"
      title="Частые"
      italic="вопросы."
      containerClassName="max-w-[880px]"
    >
      <Accordion items={faq} />
    </Section>
  );
}
