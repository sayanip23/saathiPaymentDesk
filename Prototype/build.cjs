const {existsSync, readFileSync, writeFileSync, mkdirSync} = require('node:fs');
const {join} = require('node:path');

const root = __dirname;
const read = file => readFileSync(join(root, file), 'utf8');
let html = read('page.html');
for (const [placeholder, file] of [['CSS', 'style.css'], ['ENGINE', 'engine.js'], ['UI', 'ui.js']]) {
  html = html.replace(`/*__${placeholder}__*/`, () => read(file));
}
const hero = join(root, 'india-gate.jpg');
html = html.replace('/*__HERO_ASSET__*/', existsSync(hero)
  ? `url("data:image/jpeg;base64,${readFileSync(hero).toString('base64')}")`
  : 'none');
mkdirSync(join(root, 'dist'), {recursive: true});
writeFileSync(join(root, 'dist', 'index.html'), html);
console.log('Built dist/index.html. Open it directly in a browser.');
