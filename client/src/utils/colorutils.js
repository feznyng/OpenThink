import {red, orange, blue, green, purple, } from '@material-ui/core/colors'

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}
  
export function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

export function extractColors(colorString) {
    const colorsOnly = colorString.substring(
        colorString.indexOf('(') + 1,
        colorString.lastIndexOf(')')
    ).split(/,\s*/).map(c => parseInt(c));
    return colorsOnly;
}
export function adjustRGBBrightness(rgb, opacity) {
    let colors = extractColors(rgb)
    const rgba = `rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, ${opacity ? opacity : (colors.length > 3 ? colors[3] : (1).toString())})`
    return rgba;
}

export const getLuminanace = (values) => {
    const rgb = values.map((v) => {
      const val = v / 255;
      return val <= 0.03928 ? val / 12.92 : ((val + 0.055) / 1.055) ** 2.4;
    });
    return Number((0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]).toFixed(3));
  };
  
  export const getContrastRatio = (colorA, colorB) => {
    const lumA = getLuminanace(colorA);
    const lumB = getLuminanace(colorB);
  
    return (Math.max(lumA, lumB) + 0.05) / (Math.min(lumA, lumB) + 0.05);
  };

const colors = [
    red, orange, blue, green, purple, 
]

export const getRandomColor = () => {
    const colorIndex = Math.floor(Math.random() * (colors.length - 1))

    const color = colors[colorIndex]
    const shades = Object.keys(color)
    const shadeIndex = shades[Math.floor(Math.random() * shades.length)]

    return color[shadeIndex];   
}