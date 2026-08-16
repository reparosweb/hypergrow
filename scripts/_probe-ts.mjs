import { PILLARS } from "../lib/pillars.ts";
import { CLARO_PILLAR } from "../components/claro/claroPillarAccent.ts";
console.log(PILLARS.map(p => p.key + "=" + p.label).join(" | "));
console.log("claroPillar keys:", Object.keys(CLARO_PILLAR ?? {}));
