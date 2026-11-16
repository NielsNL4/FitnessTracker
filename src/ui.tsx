import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { X, Search, Play, Dumbbell, ChevronRight } from 'lucide-react';
import { useApp } from './context';
import type { Exercise } from './domain';
import { exerciseGroups, muscleLabels } from './exerciseGroups';

export function Modal({title,children,onClose}:{title:string;children:ReactNode;onClose:()=>void}) {const ref=useRef<HTMLDialogElement>(null);useEffect(()=>{const before=document.activeElement as HTMLElement|null;ref.current?.showModal();return ()=>{ref.current?.close();before?.focus();};},[]);return <dialog ref={ref} onCancel={e=>{e.preventDefault();onClose();}}><div className="section-head"><h2>{title}</h2><button className="icon-button" aria-label="Sluiten" onClick={onClose}><X size={20}/></button></div>{children}</dialog>;}
export function Empty({children}:{children:ReactNode}) {return <p className="empty">{children}</p>;}
export function StatStrip({items}:{items:[string,ReactNode][]}) {return <div className="stats">{items.map(([label,value])=><div key={label}><span className="micro">{label}</span><strong>{value}</strong></div>)}</div>;}
export function Field({label,children}:{label:string;children:ReactNode}) {return <label className="field"><span>{label}</span>{children}</label>;}
export function Media({exercise,compact=false}:{exercise:Exercise;compact?:boolean}) {
 const {catalog}=useApp();const [play,setPlay]=useState(false),[failed,setFailed]=useState(false),[posterFailed,setPosterFailed]=useState(false);
 useEffect(()=>{setPlay(false);setFailed(false);setPosterFailed(false);},[exercise.id]);
 const root=`https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/${catalog.revision}/`;
 const safe=(p:string,kind:string)=>new RegExp(`^${kind}/[A-Za-z0-9_-]+\\.${kind==='videos'?'gif':'jpg'}$`).test(p);
 return <div className={`media ${compact?'compact':''}`}>
  {play&&!failed&&safe(exercise.gif,'videos')?<img crossOrigin="anonymous" src={root+exercise.gif} alt={`Demonstratie: ${exercise.name}`} onError={()=>setFailed(true)}/>:!posterFailed&&safe(exercise.poster,'images')?<img crossOrigin="anonymous" loading="lazy" src={root+exercise.poster} alt="" onError={()=>setPosterFailed(true)}/>:<Dumbbell className="media-placeholder" size={40}/>}
  {!compact&&<><span className="media-source">exercises-dataset · EN</span><button className="media-play" onClick={()=>{if(play){setPlay(false);}else{setFailed(false);setPlay(true);}}}><Play size={18}/>{play?'Stop demonstratie':'Start demonstratie'}</button>{failed&&<p className="media-error" role="status">Demonstratie niet beschikbaar. Instructies blijven bruikbaar.</p>}{posterFailed&&!play&&<span className="media-note">Demonstratie op aanvraag · internet nodig</span>}</>}
 </div>;
}
export function Instructions({exercise}:{exercise:{instructions:string[]}}) {return <><div className="section-head"><h3>Instructies</h3><span className="muted small">Engels · brondata</span></div><ol className="instructions">{exercise.instructions.map((s,i)=><li key={i}>{s}</li>)}</ol></>;}
export function ExercisePicker({title='Oefening toevoegen',onSelect,onClose,preferredMuscle}:{title?:string;onSelect:(e:Exercise)=>void;onClose:()=>void;preferredMuscle?:string}) {
 const {catalog}=useApp(),[query,setQuery]=useState(''),[muscle,setMuscle]=useState(preferredMuscle??''),[equipment,setEquipment]=useState('');
 const [visible,setVisible]=useState<Record<string,number>>({});
 const headingId=useId();
 const list=catalog.exercises.filter(e=>(!muscle||e.muscles.includes(muscle))&&(!equipment||e.equipment===equipment)&&e.name.toLowerCase().includes(query.toLowerCase()));
 const groups=exerciseGroups.map(group=>({...group,exercises:[] as Exercise[]}));
 for(const exercise of list) {
  const group=groups.find(g=>g.targets.includes(exercise.target))??groups[groups.length-1];
  group.exercises.push(exercise);
 }
 return <Modal title={title} onClose={onClose}>
  <label className="search"><Search size={20}/><input aria-label="Oefening zoeken" autoFocus placeholder="Zoek een oefening…" value={query} onChange={e=>{setQuery(e.target.value);setVisible({});}}/></label>
  <div className="columns">
   <Field label="Spiergroep"><select value={muscle} onChange={e=>{setMuscle(e.target.value);setVisible({});}}><option value="">Alle spieren</option>{[...new Set(catalog.exercises.flatMap(e=>e.muscles))].sort().map(m=><option key={m} value={m}>{muscleLabels[m]??m}</option>)}</select></Field>
   <Field label="Materiaal"><select value={equipment} onChange={e=>{setEquipment(e.target.value);setVisible({});}}><option value="">Alle materialen</option>{[...new Set(catalog.exercises.map(e=>e.equipment))].sort().map(m=><option key={m} value={m}>{m}</option>)}</select></Field>
  </div>
  <p className="muted small">{list.length} oefeningen · Engelse namen</p>
  <div className="picker-list">
   {groups.filter(g=>g.exercises.length>0).map(group=>{
    const limit=visible[group.label]??8;
    const remaining=group.exercises.length-limit;
    const id=`${headingId}-${group.label.replaceAll(' ','-')}`;
    return <section className="picker-group" key={group.label} aria-labelledby={id}>
     <h3 id={id}>{group.label} <span className="muted">({group.exercises.length})</span></h3>
     {group.exercises.sort((a,b)=>a.name.localeCompare(b.name)).slice(0,limit).map(e=><button type="button" className="exercise-row" key={e.id} onClick={()=>onSelect(e)}><Media exercise={e} compact/><span><strong>{e.name}</strong><small>{muscleLabels[e.target]??e.target} · {e.equipment}</small></span><ChevronRight size={18}/></button>)}
     {remaining>0&&<button type="button" className="full" aria-label={`Meer oefeningen tonen voor ${group.label} (${remaining})`} onClick={()=>setVisible(current=>({...current,[group.label]:(current[group.label]??8)+8}))}>Meer oefeningen tonen ({remaining})</button>}
    </section>;
   })}
   {!list.length&&<Empty>Geen oefeningen gevonden. Pas je zoekopdracht of filters aan.</Empty>}
  </div>
 </Modal>;
}
export function download(raw:string,name='workout-back-up.json') {const url=URL.createObjectURL(new Blob([raw],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function dayLabel(date:string) {return new Date(date+'T12:00:00').toLocaleDateString('nl-NL',{day:'numeric',month:'short'});}
export function timeLabel(ms:number) {const s=Math.max(0,Math.ceil(ms/1000));return `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;}
