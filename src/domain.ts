import { z } from 'zod';

export type Exercise = {id:string;name:string;category:string;bodyPart:string;equipment:string;target:string;muscles:string[];instructions:string[];poster:string;gif:string;attribution:string};
export type Catalog = {revision:string;source:string;exercises:Exercise[]};
const id = z.string().min(1).max(100);
const text = z.string().min(1).max(300);
const value = z.number().finite().min(0).max(1_000_000).nullable();
export const modes = ['strength','timed','distance','completion'] as const;
export const modeNames = {strength:'Kracht',timed:'Tijd',distance:'Afstand',completion:'Voltooien'};
export const goals = ['Spiermassa','Kracht','Conditie','Fit blijven','Mobiliteit'] as const;
const mode = z.enum(modes);
const unit = z.enum(['kg','lb']);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(s=>{const d=new Date(s+'T12:00:00');return !isNaN(+d)&&localDate(d)===s;},'Ongeldige datum');
const timestamp = z.number().int().min(0).max(8_640_000_000_000_000);
const setSchema = z.object({id,weight:value,reps:value,seconds:value,meters:value,done:z.boolean()}).strict();
const slotSchema = z.object({id,exerciseId:id,mode,sets:z.number().int().min(1).max(30),reps:value,seconds:value,meters:value,rest:z.number().int().min(0).max(3600)}).strict();
const templateSchema = z.object({id,name:text,goals:z.array(z.enum(['Spiermassa','Kracht','Conditie','Fit blijven','Mobiliteit'])).max(5),equipment:z.array(text).max(50),slots:z.array(slotSchema).min(1).max(100)}).strict();
const snapshotSchema = z.object({exerciseId:id,name:text,muscles:z.array(text).max(30),equipment:text,instructions:z.array(z.string().max(3000)).max(50)}).strict();
// Optional so schema-v1 sessions/backups remain valid without inventing a lost prescription.
const planSchema = z.object({sets:z.number().int().min(1).max(100),reps:z.number().int().min(0).max(10000).nullable(),seconds:z.number().finite().min(0).max(86400).nullable(),meters:value}).strict();
const entrySchema = z.object({id,slotId:id,snapshot:snapshotSchema,plan:planSchema.optional(),mode,unit,rest:z.number().int().min(0).max(3600),retired:z.boolean(),sets:z.array(setSchema).max(100)}).strict();
const timerSchema = z.object({deadline:timestamp.nullable(),remaining:z.number().finite().min(0).max(86_400_000),duration:z.number().int().min(0).max(86_400_000),running:z.boolean()}).strict().refine(t=>t.running ? t.deadline!==null : t.deadline===null,'Ongeldige timer');
const sessionSchema = z.object({id,templateId:id,name:text,startedAt:timestamp,finishedAt:timestamp.nullable(),date,entries:z.array(entrySchema).min(1).max(200),current:z.number().int().min(0).max(199),timer:timerSchema}).strict();
const preferencesSchema = z.object({unit,rest:z.number().int().min(0).max(3600),signal:z.boolean(),motion:z.enum(['system','on','off'])}).strict();
const stateSchema = z.object({schemaVersion:z.literal(1),revision:z.number().int().min(0),templates:z.array(templateSchema).max(500),history:z.array(sessionSchema).max(5000),active:sessionSchema.nullable(),schedule:z.array(z.object({date,templateId:id.nullable(),rest:z.boolean()}).strict()).max(3660),preferences:preferencesSchema}).strict();
export type SetLog = z.infer<typeof setSchema>;
export type Slot = z.infer<typeof slotSchema>;
export type Template = z.infer<typeof templateSchema>;
export type Entry = z.infer<typeof entrySchema>;
export type Session = z.infer<typeof sessionSchema>;
export type Timer = z.infer<typeof timerSchema>;
export type State = z.infer<typeof stateSchema>;
export const uid = () => crypto.randomUUID();
export function localDate(d = new Date()) {return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function initialState():State {return {schemaVersion:1,revision:0,templates:[],history:[],active:null,schedule:[],preferences:{unit:'kg',rest:90,signal:false,motion:'system'}};}
export function blankSet():SetLog {return {id:uid(),weight:null,reps:null,seconds:null,meters:null,done:false};}
export function newSlot(exerciseId:string,rest=90):Slot {return {id:uid(),exerciseId,mode:'strength',sets:3,reps:8,seconds:null,meters:null,rest};}
export function validSet(s:SetLog,m:Entry['mode']) {return m==='completion'||m==='strength' ? m==='completion'||(s.weight!==null&&s.weight<=3000&&s.reps!==null&&Number.isInteger(s.reps)&&s.reps>0&&s.reps<=10000) : m==='timed' ? s.seconds!==null&&s.seconds>0&&s.seconds<=86400 : s.meters!==null&&s.meters>0&&s.meters<=1_000_000&&(s.seconds===null||s.seconds>0&&s.seconds<=86400);}
export function snapshot(e:Exercise):Entry['snapshot'] {return {exerciseId:e.id,name:e.name,muscles:[...e.muscles],equipment:e.equipment,instructions:[...e.instructions]};}
export function startSession(t:Template,catalog:Exercise[],unit:State['preferences']['unit'],now=Date.now()):Session {return {id:uid(),templateId:t.id,name:t.name,startedAt:now,finishedAt:null,date:localDate(new Date(now)),current:0,timer:resetTimer(),entries:t.slots.map(s=>{const e=catalog.find(e=>e.id===s.exerciseId);if(!e)throw Error('Oefening ontbreekt in de bibliotheek.');return {id:uid(),slotId:s.id,snapshot:snapshot(e),plan:{sets:s.sets,reps:s.reps,seconds:s.seconds,meters:s.meters},mode:s.mode,unit,rest:s.rest,retired:false,sets:Array.from({length:s.sets},blankSet)};})};}
export function replaceEntry(session:Session,entryId:string,e:Exercise):Session {
 const next=structuredClone(session),index=next.entries.findIndex(e=>e.id===entryId);if(index<0)throw Error('Oefening niet gevonden.');
 const original=next.entries[index]; if(original.retired)throw Error('Deze oefening is al vervangen.');
 // Retain the slot's set-count intention, not another exercise's numeric target/results.
 // No prescription for the chosen alternative was supplied: record that explicitly.
 const plan={sets:original.plan?.sets??Math.max(1,original.sets.length),reps:null,seconds:null,meters:null};
 const replacement:Entry={...original,id:uid(),snapshot:snapshot(e),plan,sets:Array.from({length:plan.sets},blankSet)};
 original.retired=true;original.sets=original.sets.filter(s=>s.done);
 next.entries.splice(index+1,0,replacement);return next;
}
export function finishSession(state:State,sessionId:string,now=Date.now()):State {
 if(state.history.some(s=>s.id===sessionId))return state;
 if(!state.active||state.active.id!==sessionId)throw Error('Actieve sessie is gewijzigd.');
 if(!state.active.entries.some(e=>e.sets.some(s=>s.done)))throw Error('Log eerst minimaal één geldige set.');
 const finished={...structuredClone(state.active),finishedAt:now,timer:resetTimer()};
 return {...state,history:[finished,...state.history],active:null};
}
export function previousValues(history:Session[],entry:Entry,index:number):SetLog|undefined {for(const s of [...history].sort((a,b)=>(b.finishedAt??0)-(a.finishedAt??0))) {for(const e of [...s.entries].reverse())if(e.snapshot.exerciseId===entry.snapshot.exerciseId&&e.mode===entry.mode&&(entry.mode!=='strength'||e.unit===entry.unit)){const sets=e.sets.filter(s=>s.done);if(sets[index])return sets[index];}}}
export function resetTimer():Timer {return {deadline:null,remaining:0,duration:0,running:false};}
export function startTimer(seconds:number,now=Date.now()):Timer {const ms=seconds*1000;return {deadline:ms?now+ms:null,remaining:ms,duration:ms,running:ms>0};}
export function remaining(t:Timer,now=Date.now()) {return t.running?Math.max(0,(t.deadline??now)-now):t.remaining;}
export function pauseTimer(t:Timer,now=Date.now()):Timer {return {...t,remaining:remaining(t,now),deadline:null,running:false};}
export function resumeTimer(t:Timer,now=Date.now()):Timer {return {...t,deadline:t.remaining>0?now+t.remaining:null,running:t.remaining>0};}
export function extendTimer(t:Timer,now=Date.now()):Timer {const r=Math.min(86_400_000,remaining(t,now)+30_000);return {...t,remaining:r,duration:Math.max(t.duration,r),deadline:t.running?now+r:null};}
function unique(ids:string[],label:string) {if(new Set(ids).size!==ids.length)throw Error(`Dubbele ID in ${label}.`);}
export const MAX_BACKUP_BYTES=10*1024*1024;
export function validateState(input:unknown,exerciseIds:Set<string>):State {
 const parsed=stateSchema.safeParse(input);if(!parsed.success)throw Error('Ongeldige back-up of niet-ondersteunde versie. Controleer het originele JSON-bestand.');
 const s=parsed.data;unique(s.templates.map(t=>t.id),'schema’s');unique(s.history.map(t=>t.id),'geschiedenis');unique(s.schedule.map(t=>t.date),'planning');
 const tids=new Set(s.templates.map(t=>t.id));
 for(const t of s.templates) {unique(t.slots.map(e=>e.id),'oefenvolgorde');for(const e of t.slots){if(!exerciseIds.has(e.exerciseId))throw Error('Onbekende oefening in schema.');if(e.reps!==null&&(!Number.isInteger(e.reps)||e.reps>10000)||e.seconds!==null&&e.seconds>86400)throw Error('Ongeldig oefendoel.');}}
 for(const d of s.schedule)if(d.templateId&&!tids.has(d.templateId)||d.rest&&d.templateId)throw Error('Planning verwijst naar een ontbrekend schema.');
 if(s.active&&s.history.some(h=>h.id===s.active!.id))throw Error('Sessie is zowel actief als afgerond.');
 for(const session of [...s.history,...(s.active?[s.active]:[])]) {
  if(session.finishedAt!==null&&session.finishedAt<session.startedAt)throw Error('Ongeldige sessietijden.');
  if(session===s.active&&session.finishedAt!==null||session!==s.active&&session.finishedAt===null)throw Error('Ongeldige sessiestatus.');
  if(session.current>=session.entries.filter(e=>!e.retired).length)throw Error('Ongeldige sessiepositie.');
  unique(session.entries.map(e=>e.id),'sessieoefeningen');
  for(const e of session.entries) {if(!exerciseIds.has(e.snapshot.exerciseId))throw Error('Onbekende oefening in sessie.');unique(e.sets.map(x=>x.id),'sets');for(const set of e.sets)if(set.done&&!validSet(set,e.mode))throw Error('Ongeldige afgeronde set.');}
 }
 return s;
}
export function parseBackup(raw:string,exerciseIds:Set<string>):State {if(new TextEncoder().encode(raw).length>MAX_BACKUP_BYTES)throw Error('Bestand is groter dan 10 MB.');let input:unknown;try{input=JSON.parse(raw);}catch{throw Error('Geen geldig JSON-bestand.');}return validateState(input,exerciseIds);}
export function exportBackup(s:State) {return JSON.stringify(s,null,2);}
export function describeSet(s:SetLog,m:Entry['mode'],unit='kg') {return m==='strength'?`${s.weight??'–'} ${unit} × ${s.reps??'–'}`:m==='timed'?`${s.seconds??'–'} s`:m==='distance'?`${s.meters??'–'} m${s.seconds!==null?` / ${s.seconds} s`:''}`:'Voltooid';}
export function describePlan(entry:Entry) {
 const p=entry.plan;if(!p)return 'Doel niet vastgelegd in deze oudere sessie.';
 const target=entry.mode==='strength'?(p.reps===null?'Herhalingsdoel niet ingesteld':`${p.reps} herhalingen per set`):entry.mode==='timed'?(p.seconds===null?'Tijddoel niet ingesteld':`${p.seconds} s per set`):entry.mode==='distance'?(p.meters===null?'Afstandsdoel niet ingesteld':`${p.meters} m per set${p.seconds===null?'':` · ${p.seconds} s`}`):'Alleen voltooien, zonder meting';
 return `Gepland: ${p.sets} ${p.sets===1?'set':'sets'} · ${target}. Geen gelogd resultaat.`;
}
export function sessionVolumes(session:Session):{unit:Entry['unit'];value:number}[] {
 const totals=new Map<Entry['unit'],number>();
 for(const e of session.entries)if(e.mode==='strength')for(const s of e.sets)if(s.done)totals.set(e.unit,(totals.get(e.unit)??0)+s.weight!*s.reps!);
 return (['kg','lb'] as const).filter(unit=>totals.has(unit)).map(unit=>({unit,value:totals.get(unit)!}));
}
