const css = "color-mix(in srgb, rgb(0, 255, 0) 10%, transparent)";
const m = css.match(/color-mix\(in srgb, (.*?) (\d+)%, transparent\)/);
console.log(m);
