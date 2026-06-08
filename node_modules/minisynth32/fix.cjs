const fs = require('fs');
let css = fs.readFileSync('src/styles/global.css', 'utf8');

// 1. Apply sulu palette
css = css.replace(/--panel-blue-1:\s*#[0-9a-fA-F]+;/, '--panel-blue-1: #579b15;');
css = css.replace(/--panel-blue-2:\s*#[0-9a-fA-F]+;/, '--panel-blue-2: #305017;');
css = css.replace(/--panel-blue-3:\s*#[0-9a-fA-F]+;/, '--panel-blue-3: #162c07;');
css = css.replace(/--panel-line:\s*#[0-9a-fA-F]+;/, '--panel-line: #aeea68;');
css = css.replace(/--panel-text:\s*#[0-9a-fA-F]+;/, '--panel-text: #ffffff;');
css = css.replace(/--panel-text-dim:\s*#[0-9a-fA-F]+;/, '--panel-text-dim: #f5fde8;');
css = css.replace(/--save-green:\s*#[0-9a-fA-F]+;/, '--save-green: #72c220;');
css = css.replace(/--led-on:\s*#[0-9a-fA-F]+;/, '--led-on: #ff4444;');

// title light lowercase left
css = css.replace(/@import url\("https:\/\/fonts.googleapis.com\/css2\?family=Roboto:wght@400;500;700;800;900&display=swap"\);/, '@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;800;900&display=swap");');
css = css.replace(/(\.mfb-title\s*\{[^}]*?font-weight:\s*)800(;|})/, '$1300$2');
css = css.replace(/(\.mfb-title\s*\{[^}]*?text-transform:\s*)uppercase(;|})/, '$1lowercase$2');
css = css.replace(/(\.top-center\s*\{[^}]*?align-items:\s*)center(;|})/, '$1flex-start$2');

// 2. Remove all gradients
// Match linear-gradient or radial-gradient, grab the first valid color (hex or rgba/var) we want to keep
css = css.replace(/(linear|radial)-gradient\(([^)]+)\)/g, (match, type, content) => {
    const hexMatch = content.match(/#[0-9a-fA-F]{3,8}/);
    if (hexMatch) return hexMatch[0];
    
    const rgbaMatch = content.match(/rgba?\([^)]+\)/);
    if (rgbaMatch) return rgbaMatch[0];

    const varMatch = content.match(/var\([^)]+\)/);
    if (varMatch) return varMatch[0];
    
    return 'transparent'; // fallback
});

// Vibrant green background for panel
// We know .mfb-faceplate was background: #1a1a1a (from gradient replacement), we replace it with #579b15
css = css.replace(/(\.mfb-faceplate\s*\{[^}]*?background:\s*)#[0-9a-fA-F]+(;|})/, '$1#579b15$2');

fs.writeFileSync('src/styles/global.css', css);
console.log('done');
