import {
  CalendarCheck,
  Wrench,
  Sparkles,
  Camera,
  Radar,
  Truck,
  Globe,
  ShoppingCart,
  Boxes,
  Workflow,
  BrainCircuit,
  Palette,
  Rocket,
  Cpu,
  TrendingUp,
  LifeBuoy,
  ShieldCheck,
  SlidersHorizontal,
  Search,
  ClipboardList,
  Code2,
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
  Globe,
  ShoppingCart,
  Boxes,
  Workflow,
  BrainCircuit,
  Palette,
  Rocket,
  Cpu,
  TrendingUp,
  LifeBuoy,
  ShieldCheck,
  SlidersHorizontal,
  Search,
  ClipboardList,
  Code2,
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
