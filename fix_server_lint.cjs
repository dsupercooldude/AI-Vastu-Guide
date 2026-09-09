const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// Fix implicitly any parameters
content = content.replace(/async function generateWithFallback\(options, preferredModel = null\)/, 'async function generateWithFallback(options: any, preferredModel: string | null = null)');
content = content.replace(/class ModelMutex \{/, 'class ModelMutex {\n  mutexes: Record<string, Promise<void> | null>;');
content = content.replace(/constructor\(\) \{\n    this\.mutexes = \{\};\n  \}/, 'constructor() {\n    this.mutexes = {};\n  }');
content = content.replace(/async lock\(model\) \{/, 'async lock(model: string) {');
content = content.replace(/unlock\(model\) \{/, 'unlock(model: string) {');
content = content.replace(/const delay = ms => new Promise\(resolve => setTimeout\(resolve, ms\)\);/, 'const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));');

// Fix error is of type unknown
content = content.replace(/catch \(error\) \{/g, 'catch (error: any) {');
// Need to handle catch (e) {
content = content.replace(/catch \(e\) \{/g, 'catch (e: any) {');

content = content.replace(/function incrementQuota\(modelName\) \{/, 'function incrementQuota(modelName: string) {');

// Fix allVisuals type
content = content.replace(/const allVisuals = \[\];/, 'const allVisuals: any[] = [];');
content = content.replace(/floorPlans\.forEach\(\(fp, i\) =>/, 'floorPlans.forEach((fp: any, i: number) =>');
content = content.replace(/images\.forEach\(\(img, i\) =>/, 'images.forEach((img: any, i: number) =>');

// Fix response.text is possibly undefined
content = content.replace(/response\.text\.replace/g, '(response.text || "").replace');
content = content.replace(/response\.text\.match/g, '(response.text || "").match');
content = content.replace(/report: response\.text,/g, 'report: (response.text || ""),');
content = content.replace(/finalResponse\.text\.replace/g, '(finalResponse.text || "").replace');
content = content.replace(/finalResponse\.text\.match/g, '(finalResponse.text || "").match');
content = content.replace(/report: finalResponse\.text,/g, 'report: (finalResponse.text || ""),');
content = content.replace(/result: response\.text,/g, 'result: response.text || "",');

// Fix messages map
content = content.replace(/messages\.map\(\(m\) => \(\{/g, 'messages.map((m: any) => ({');

fs.writeFileSync('server.ts', content);
