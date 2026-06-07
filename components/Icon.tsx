import {
  CalendarCheck,
  Wrench,
  Sparkles,
  Camera,
  Radar,
  Truck,
  type LucideIcon,
  CircleDashed,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  CalendarCheck,
  Wrench,
  Sparkles,
  Camera,
  Radar,
  Truck,
};

export function ProductIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Cmp = map[name] ?? CircleDashed;
  return <Cmp className={className} strokeWidth={1.6} />;
}
