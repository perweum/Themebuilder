import { writeFileSync } from "fs";
import { mapTheme } from "./lib/theme-mapper.js";
import { generateRamp } from "./lib/palette-generator.js";

const colors = [{ name: "brand", seed: "#0142FE" }];
const neutralHex = "#64748b";
const successHex = "#22c55e";
const errorHex = "#ef4444";

const mappedColors = colors.map((c) => ({ name: c.name, gen: generateRamp(c.seed) }));
const neutralGen = generateRamp(neutralHex);
const successGen = generateRamp(successHex);
const errorGen = generateRamp(errorHex);

const payload = mapTheme(mappedColors, neutralGen, successGen, errorGen);

writeFileSync(
  "test-figma.json",
  JSON.stringify(
    {
      Primitives: { color: payload.color },
      Light: { theme: payload.theme },
      Dark: { darkTheme: payload.darkTheme },
    },
    null,
    2,
  ),
);

console.log("Written test-figma.json");
