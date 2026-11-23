/* Dependency-free smoke checks: transpiles spreadsheet.ts using globally installed TypeScript. */
let ts;try{ts=require('typescript')}catch{ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript')};
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/../lib/spreadsheet.ts','utf8');
const javascript=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const scopedExports={};vm.runInNewContext(javascript,{exports:scopedExports,module:{exports:scopedExports}});
const {initialCells,evaluateCell}=scopedExports;
const cells={...initialCells(),H3:'=SUM(B3:G3)',H4:'=COUNT(B4:G4)',H5:'=AVERAGE(B5:G5)',H6:'=MAX(B6:G6)',H7:'=MIN(B7:G7)',H8:'=B8+C8+D8+E8+F8+G8'};
assert.equal(evaluateCell('H3',cells),750);
assert.equal(evaluateCell('H4',cells),6);
assert.equal(evaluateCell('H5',cells),100);
assert.equal(evaluateCell('H6',cells),300);
assert.equal(evaluateCell('H7',cells),0);
assert.equal(evaluateCell('H8',cells),250);
assert.equal(evaluateCell('H9',{...cells,H9:'=COUNT(B10:G10)'}),0);
assert.equal(evaluateCell('H3',{...cells,H3:'=alert(7)'}),'#ERROR!');
assert.equal(evaluateCell('H3',{...cells,H3:'=H3'}),'#ERROR!');
console.log('Spreadsheet runtime smoke checks passed');
