import { Section } from "@/components/ui";
import { LeadForm } from "./LeadForm";

export function Apply() {
  return (
    <Section
      id="apply"
      eyebrow="Пробный урок"
      title="Запишись на"
      italic="бесплатный урок."
      description="Оставь контакты — познакомимся, определим уровень и предложим план подготовки."
      containerClassName="max-w-[880px]"
    >
      <LeadForm />
    </Section>
  );
}
