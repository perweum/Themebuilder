const { writeFileSync } = require('fs');
const { execSync } = require('child_process');

try {
  execSync('npx tsc ./lib/theme-mapper.ts ./lib/palette-generator.ts --target ES2020 --module CommonJS --outDir ./dist-test');
} catch(e) {}

const { mapTheme } = require('./dist-test/theme-mapper.js');
const { generateRamp } = require('./dist-test/palette-generator.js');

const colors = [{ name: 'brand', seed: '#0142FE' }];
const neutralHex = '#64748b';
const successHex = '#22c55e';
const errorHex = '#ef4444';

const mappedColors = colors.map(c => ({ name: c.name, gen: generateRamp(c.seed) }));
const neutralGen = generateRamp(neutralHex);
const successGen = generateRamp(successHex);
const errorGen = generateRamp(errorHex);

const payload = mapTheme(mappedColors, neutralGen, successGen, errorGen);

writeFileSync('test-figma.json', JSON.stringify({
    "Primitives": { "color": payload.color },
    "Light": { "theme": payload.theme },
    "Dark": { "darkTheme": payload.darkTheme }
}, null, 2));

console.log("Written test-figma.json");
