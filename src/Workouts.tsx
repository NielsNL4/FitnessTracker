import { useEffect, useRef, useState } from 'react';
import { Plus, Pencil, Copy, Trash2, Play, Dumbbell, ArrowUp, ArrowDown, X, Save, Clock3 } from 'lucide-react';
import { useApp } from './context';
import { goals, modeNames, modes, newSlot, startSession, uid, type Template } from './domain';
import { Empty, ExercisePicker, Field, Media, StatStrip } from './ui';

export function examples():Template[] {return [
 {id:'example-push',name:'Push · Borst & armen',goals:['Spiermassa'],equipment:['barbell','dumbbell'],slots:['0025','0294'].map(id=>newSlot(id))},
 {id:'example-pull',name:'Pull · Rug & biceps',goals:['Kracht'],equipment:['barbell','dumbbell'],slots:['0027','0294'].map(id=>newSlot(id))},
 {id:'example-legs',name:'Legs · Benen',goals:['Kracht'],equipment:['barbell'],slots:['0043','0032'].map(id=>newSlot(id))}
 ];}
export function Workouts() {
 const {state,save,go,confirm,notify,catalog}=useApp();
 const [tab,setTab]=useState('mine'),[editing,setEditing]=useState<Template>(),[adding,setAdding]=useState(false),[draftError,setDraftError]=useState('');
 const [addedSlot,setAddedSlot]=useState<string>();
 const pendingScroll=useRef<number|undefined>(undefined);
 const reducedMotion=()=>state.preferences.motion==='on'||(state.preferences.motion==='system'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>()=>{window.clearTimeout(pendingScroll.current);},[]);
 useEffect(()=>{
  if(!addedSlot||adding)return;
  // Wait until the picker has restored focus before scrolling the new card into view.
  const frame=requestAnimationFrame(()=>document.getElementById(`editor-slot-${addedSlot}`)?.scrollIntoView({behavior:reducedMotion()?'instant':'smooth',block:'start'}));
  return ()=>cancelAnimationFrame(frame);
 },[addedSlot,adding]);
 const [samples]=useState(examples);const templates=tab==='mine'?state.templates:samples;
 const weekAgo=Date.now()-7*86400000,weekly=state.history.filter(s=>(s.finishedAt??0)>=weekAgo).length;
 const edit=(t?:Template)=>{
  setAddedSlot(undefined);
  setEditing(t?structuredClone(t):{id:uid(),name:'',goals:[],equipment:[],slots:[]});setDraftError('');
  window.clearTimeout(pendingScroll.current);
  pendingScroll.current=window.setTimeout(()=>document.getElementById('workout-editor')?.scrollIntoView({behavior:reducedMotion()?'instant':'smooth',block:'start'}),20);
 };
 const start=async(t:Template)=>{if(state.active){if(await confirm('Er is al een actieve sessie','Hervat je huidige training. Rond deze af of breek deze af voordat je een nieuwe start.','Hervatten'))go('sessie');return;}if(await save(s=>({...s,active:startSession(t,catalog.exercises,s.preferences.unit)})))go('sessie');};
 const duplicate=async(t:Template)=>{const copy={...structuredClone(t),id:uid(),name:t.name+' (kopie)',slots:t.slots.map(s=>({...s,id:uid()}))};if(await save(s=>({...s,templates:[...s.templates,copy]}))){setTab('mine');notify(tab==='examples'?'Voorbeeld toegevoegd aan Mijn schema’s.':'Schema gedupliceerd.');}};
 const remove=async(t:Template)=>{if(await confirm('Schema verwijderen?',`“${t.name}” wordt verwijderd. Je sessies en geschiedenis blijven bewaard.`,'Verwijderen')){await save(s=>({...s,templates:s.templates.filter(x=>x.id!==t.id),schedule:s.schedule.filter(d=>d.templateId!==t.id)}));if(editing?.id===t.id)setEditing(undefined);}};
 const saveEditor=async()=>{if(!editing)return;if(!editing.name.trim()||!editing.slots.length){setDraftError('Geef je schema een naam en voeg minimaal één oefening toe.');return;}const next={...editing,name:editing.name.trim()};if(await save(s=>({...s,templates:s.templates.some(t=>t.id===next.id)?s.templates.map(t=>t.id===next.id?next:t):[...s.templates,next]}))){setEditing(undefined);setTab('mine');notify('Schema opgeslagen.');}};
 return <>
  <div className="section-head page-heading"><div><span className="eyebrow">Bibliotheek & maker</span><p>Mijn workouts</p></div><button className="primary compact-button" onClick={()=>edit()}><Plus size={17}/> Nieuwe training</button></div>
  <section className="panel weekly-summary"><span className="round-icon"><Clock3 size={21}/></span><div><p>Consistentie deze week</p><strong>{weekly} {weekly===1?'training':'trainingen'} in de afgelopen 7 dagen</strong></div><span className="badge">Jouw ritme</span></section>
  <div className="segmented" role="tablist" aria-label="Schema’s"><button role="tab" aria-selected={tab==='mine'} className={tab==='mine'?'selected':''} onClick={()=>setTab('mine')}>Mijn schema’s <span>{state.templates.length}</span></button><button role="tab" aria-selected={tab==='examples'} className={tab==='examples'?'selected':''} onClick={()=>setTab('examples')}>Voorbeeldschema’s <span>3</span></button></div>
  <div className="workout-list">
   {!templates.length&&<Empty>Je eerste training begint hier. Maak een schema of kopieer een gelabeld voorbeeld.</Empty>}
   {templates.map(t=><article className="panel workout-card" key={t.id}>
    <div className="card-title"><span className="round-icon"><Dumbbell size={19}/></span><div><h2>{t.name}</h2><p className="small muted">{t.slots.length} oefeningen · {tab==='examples'?'Voorbeeldschema':'Persoonlijk schema'}</p></div></div>
    <StatStrip items={[["Doel",t.goals.join(', ')||'Niet gekozen'],['Sets',`${t.slots.reduce((n,s)=>n+s.sets,0)} totaal`],['Focus',t.equipment.join(', ')||'Vrij']]} />
    <div className="workout-actions"><button className="primary" onClick={()=>void start(t)}><Play size={16}/>Starten</button><button className="icon-button" aria-label={`Bewerk ${t.name}`} onClick={()=>tab==='examples'?void duplicate(t):edit(t)}><Pencil size={17}/></button><button className="icon-button" aria-label={`Dupliceer ${t.name}`} onClick={()=>void duplicate(t)}><Copy size={17}/></button><button className="icon-button danger" aria-label={`Verwijder ${t.name}`} disabled={tab==='examples'} onClick={()=>void remove(t)}><Trash2 size={17}/></button></div>
   </article>)}
  </div>
  {editing&&<section className="panel editor" id="workout-editor">
   <div className="section-head"><div><span className="eyebrow">Workout-maker</span><h2>Schema opstellen</h2></div><button className="icon-button" aria-label="Editor sluiten" onClick={async()=>{if(await confirm('Editor sluiten?','Niet-opgeslagen schemawijzigingen vervallen.','Sluiten'))setEditing(undefined);}}><X size={20}/></button></div>
   <Field label="Naam van training"><input value={editing.name} maxLength={300} onChange={e=>setEditing({...editing,name:e.target.value})} placeholder="Bijvoorbeeld Bovenlichaam kracht"/></Field>
   <h3>Trainingsdoelen <small className="muted">Meerdere mogelijk</small></h3><div className="chips">{goals.map(g=><button className={editing.goals.includes(g)?'selected':''} key={g} aria-pressed={editing.goals.includes(g)} onClick={()=>setEditing({...editing,goals:editing.goals.includes(g)?editing.goals.filter(x=>x!==g):[...editing.goals,g]})}>{editing.goals.includes(g)?'✓ ':''}{g}</button>)}</div>
   <h3>Beschikbare apparatuur</h3><div className="chips">{[...new Set(catalog.exercises.map(e=>e.equipment))].sort().map(e=><button key={e} aria-pressed={editing.equipment.includes(e)} className={editing.equipment.includes(e)?'selected':''} onClick={()=>setEditing({...editing,equipment:editing.equipment.includes(e)?editing.equipment.filter(x=>x!==e):[...editing.equipment,e]})}>{e}</button>)}</div>
   <div className="section-head"><h3>Oefeningen in schema ({editing.slots.length})</h3><span className="small accent">Wijzig de volgorde</span></div>
   {editing.slots.map((slot,i)=>{
    const exercise=catalog.exercises.find(e=>e.id===slot.exerciseId);
    const name=exercise?.name??'Oefening niet beschikbaar';
    const change=(key:string,value:unknown)=>setEditing({...editing,slots:editing.slots.map(s=>{
     if(s.id!==slot.id)return s;
     const next={...s,[key]:value};
     if(key==='weight'&&value===undefined)delete next.weight;
     return next;
    })});
    const move=(dir:number)=>{const next=[...editing.slots];[next[i],next[i+dir]]=[next[i+dir],next[i]];setEditing({...editing,slots:next});};
    return <div className="editor-slot" id={`editor-slot-${slot.id}`} key={slot.id}>
     <div className="section-head"><strong>{name}</strong><div className="mini-actions">
      <button aria-label={`Verplaats ${name} omhoog`} disabled={!i} onClick={()=>move(-1)}><ArrowUp size={16}/></button>
      <button aria-label={`Verplaats ${name} omlaag`} disabled={i===editing.slots.length-1} onClick={()=>move(1)}><ArrowDown size={16}/></button>
      <button className="danger" aria-label={`Verwijder oefening ${name}`} onClick={()=>setEditing({...editing,slots:editing.slots.filter(s=>s.id!==slot.id)})}><X size={16}/></button>
     </div></div>
     {exercise?<Media exercise={exercise} editor failureMessage="Demonstratie niet beschikbaar. Je kunt je schema blijven bewerken."/>:<p className="empty">Demonstratie niet beschikbaar. Je kunt deze oefening verwijderen of je schema blijven bewerken.</p>}
     <div className="columns">
      <Field label="Registratie"><select value={slot.mode} onChange={e=>change('mode',e.target.value)}>{modes.map(m=><option key={m} value={m}>{modeNames[m]}</option>)}</select></Field>
      <Field label="Sets"><input type="number" min="1" max="30" value={slot.sets} onChange={e=>change('sets',e.target.value===''?0:Number(e.target.value))}/></Field>
     </div>
     <div className="columns">
      {slot.mode!=='completion'&&<Field label={slot.mode==='strength'?'Doel herhalingen':slot.mode==='timed'?'Doel seconden':'Doel meters'}><input type="number" min="1" max={slot.mode==='timed'?86400:slot.mode==='strength'?10000:1000000} value={(slot.mode==='strength'?slot.reps:slot.mode==='timed'?slot.seconds:slot.meters)??''} onChange={e=>change(slot.mode==='strength'?'reps':slot.mode==='timed'?'seconds':'meters',e.target.value===''?null:Number(e.target.value))}/></Field>}
      {slot.mode==='strength'&&<Field label={`Gepland gewicht (${slot.weight?.unit??state.preferences.unit}, optioneel)`}><input type="number" inputMode="decimal" min="0" max="3000" step="any" placeholder="Geen gewichtsdoel" value={slot.weight?.value??''} onChange={e=>change('weight',e.target.value===''?undefined:{value:Number(e.target.value),unit:slot.weight?.unit??state.preferences.unit})}/></Field>}
      {slot.mode==='distance'&&<Field label="Doel seconden (optioneel)"><input type="number" min="1" max="86400" step="any" value={slot.seconds??''} onChange={e=>change('seconds',e.target.value===''?null:Number(e.target.value))}/></Field>}
      <Field label="Rust (seconden)"><input type="number" min="0" max="3600" value={slot.rest} onChange={e=>change('rest',Number(e.target.value))}/></Field>
     </div>
    </div>;
   })}
   <button className="outlined full" onClick={()=>setAdding(true)}><Plus size={18}/>Oefening zoeken & toevoegen</button>
   {draftError&&<p className="error-text" role="alert">{draftError}</p>}
   <button className="primary full" onClick={()=>void saveEditor()}><Save size={18}/>Schema opslaan</button><p className="small muted">Je schema wordt pas opgeslagen met deze knop.</p>
  </section>}
  {adding&&editing&&<ExercisePicker onClose={()=>setAdding(false)} onSelect={e=>{
   const slot=newSlot(e.id,state.preferences.rest);
   window.clearTimeout(pendingScroll.current);
   setEditing({...editing,slots:[...editing.slots,slot]});setAdding(false);
   setAddedSlot(slot.id);
  }}/>}
 </>;
}
