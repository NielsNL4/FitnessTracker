import { openDB, type IDBPDatabase } from 'idb';
import { initialState, validateState, type State } from './domain.ts';
let db:IDBPDatabase|undefined;
let queue:Promise<unknown>=Promise.resolve();
export class StaleWriteError extends Error {constructor(){super('Een ander tabblad heeft gegevens gewijzigd. Je concept blijft zichtbaar. Exporteer het concept of laad de nieuwste gegevens.');}}
export async function openStorage(ids:Set<string>):Promise<State> {
 db=await openDB('workout-tracker',1,{upgrade(db,old){if(old===0)db.createObjectStore('state');},blocked(){window.dispatchEvent(new Event('storage-blocked'));},blocking(){db?.close();window.dispatchEvent(new Event('storage-blocked'));}});
 const tx=db.transaction('state','readwrite'),raw=await tx.store.get('current');
 if(raw===undefined) {const state=initialState();await tx.store.put(state,'current');await tx.done;return state;}
 await tx.done;return validateState(raw,ids);
}
export async function readStorage(ids:Set<string>) {if(!db)throw Error('Opslag niet beschikbaar.');return validateState(await db.get('state','current'),ids);}
export function commitState(candidate:State,expected:number,ids:Set<string>):Promise<State> {
 const run=async()=>{if(!db)throw Error('Opslag niet beschikbaar.');const next=validateState({...candidate,revision:expected+1},ids);const tx=db.transaction('state','readwrite');const raw=await tx.store.get('current');if(!raw||raw.revision!==expected){tx.abort();await tx.done.catch(()=>{});throw new StaleWriteError();}await tx.store.put(next,'current');await tx.done;return next;};
 const result=queue.then(run);queue=result.catch(()=>{});return result;
}
