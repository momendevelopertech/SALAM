import { ArrowLeft, ArrowRight, type LucideProps } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type DirArrowProps = Omit<LucideProps, "ref"> & {
  forward?: boolean;
};

export function DirArrow({ forward = true, ...props }: DirArrowProps) {
  const { dir } = useI18n();
  const pointsForward = forward === (dir === "ltr");
  return pointsForward ? <ArrowRight {...props} /> : <ArrowLeft {...props} />;
}
