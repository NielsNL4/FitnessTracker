// Uses the esbuild already supplied by Vite; no test-only tool bundle.
import { build } from 'esbuild';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
await mkdir('/tmp/opencode',{recursive:true});
const temp=await mkdtemp('/tmp/opencode/workout-tests-');
try {
 await build({entryPoints:['tests/domain.test.ts'],bundle:true,platform:'node',format:'esm',outfile:temp+'/domain.test.mjs'});
 const result=spawnSync(process.execPath,['--test',temp+'/domain.test.mjs'],{stdio:'inherit'});
 process.exitCode=result.status??1;
} finally {await rm(temp,{recursive:true,force:true});}
