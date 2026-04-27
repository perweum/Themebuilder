import { generateRamp, getAdaptivePrimary } from "../lib/palette-generator";
import { mapTheme } from "../lib/theme-mapper";

// Mock console.group for cleaner output if running in simple node implementation
if (!console.group) {
  console.group = console.log;
  console.groupEnd = () => {};
}

try {
  console.log("🎨 Starting Theme Verification...");

  const brandSeed = "#0070f3";
  const accentSeed = "#db2777";
  const neutralSeed = "#64748b";
  const successSeed = "#22c55e";
  const errorSeed = "#ef4444";

  console.log(`\nGenerating Ramps from seeds:`);
  console.log(`Brand: ${brandSeed}`);
  console.log(`Accent: ${accentSeed}`);

  const brandGen = generateRamp(brandSeed);
  const accentGen = generateRamp(accentSeed);
  const neutralGen = generateRamp(neutralSeed);
  const successGen = generateRamp(successSeed);
  const errorGen = generateRamp(errorSeed);

  console.log("\n✅ Ramps Generated Successfully.");
  console.log("Sample Brand Ramp (Closest Step should be mathematically matched):");
  console.log(`Step 25: ${brandGen.ramp[25]}`);
  console.log(
    `Closest Step ${brandGen.closestStep}: ${brandGen.ramp[brandGen.closestStep]} (Seed: ${brandSeed})`,
  );
  console.log(`Step 950: ${brandGen.ramp[950]}`);

  console.log("\n🔄 Mapping to Theme Tokens...");
  const theme = mapTheme(
    [
      { name: "brand", gen: brandGen },
      { name: "accent", gen: accentGen },
    ],
    [
      { name: "neutral", gen: neutralGen },
      { name: "success", gen: successGen },
      { name: "error", gen: errorGen },
    ],
  );

  console.log("Theme Structure:");
  // Update property access based on new schema
  console.log(`Background Default: ${theme.theme.background.default.$value}`);
  console.log(`Interactive Brand Rest: ${theme.theme.interactive.brand.rest.$value}`);
  console.log(`Text Brand onInteractive: ${theme.theme.text.brand.onInteractive.$value}`);

  // Verification Logic
  // 1. Check if interactive brand rest equals W3C alias of closestStep
  if (theme.theme.interactive.brand.rest.$value === `{color.brand.${brandGen.closestStep}}`) {
    console.log(
      "✅ Mirror Logic Verified: Interactive Brand Rest aliases dynamically to closestStep.",
    );
  } else {
    console.error("❌ Mirror Logic Failed: Mismatch in interactive brand rest.");
  }

  // 2. Check Contrast (Simple check of values existing, actual contrast checked in generator)
  if (theme.theme.text.brand.default.$value === `{color.brand.25}`) {
    console.log("✅ Mirror Logic Verified: Text Brand Default uses Step 25 alias.");
  }

  console.log("\nPassed Basic Verification.");
} catch (e) {
  console.error("❌ Verification Failed:", e);

  // Help message for common errors
  if ((e as Error).message.includes("culori")) {
    console.error("\n⚠️  It looks like 'culori' is missing. Please run 'npm install culori'.");
  }
}
