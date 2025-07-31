import type { Config } from "drizzle-kit";
import { drizzleConfig } from "./src/config";

export default {
    ...drizzleConfig.development,
} satisfies Config; 