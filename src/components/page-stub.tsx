import { useI18n } from "@/lib/i18n";

export function PageStub({ titleKey, bodyKey }: { titleKey: string; bodyKey?: string }) {
  const { t } = useI18n();
  return (
    <div className="container-salam py-24">
      <div className="gold-rule" />
      <h1 className="mt-6 font-display text-4xl">{t(titleKey)}</h1>
      {bodyKey && (
        <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">{t(bodyKey)}</p>
      )}
    </div>
  );
}
