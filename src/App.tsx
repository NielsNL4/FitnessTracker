import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, CalendarDays, Dumbbell, List, PersonStanding, Settings as SettingsIcon, TrendingUp, UserRound } from 'lucide-react';
import { exportBackup, validateState, type Catalog, type State } from './domain';
import { commitState, openStorage, readStorage } from './storage';
import { Context } from './context';
import { download, Modal } from './ui';
import { Today } from './Today';
import { Workouts } from './Workouts';
import { Library } from './Library';
import { SessionScreen } from './Session';
import { Progress } from './Progress';
import { Settings } from './Settings';
const tabs=[['vandaag','Vandaag',CalendarDays],['trainingen','Trainingen',List],['oefeningen','Oefeningen',PersonStanding],['voortgang','Voortgang',TrendingUp]] as const;
export function App() {
 const [catalog,setCatalog]=useState<Catalog>(),[state,setState]=useState<State>(),[fatal,setFatal]=useState(''),[error,setError]=useState(''),[notice,setNotice]=useState(''),[screen,setScreen]=useState(location.hash.slice(1)||'vandaag'),[pending,setPending]=useState(0),[stale,setStale]=useState(false),[offline,setOffline]=useState(!navigator.onLine);
 const [question,setQuestion]=useState<{title:string;message:string;label:string;resolve:(value:boolean)=>void}>();
 const ref=useRef<State|undefined>(undefined),savedRevision=useRef(0),failed=useRef(false),chain=useRef<Promise<unknown>>(Promise.resolve()),ids=useRef(new Set<string>()),channel=useRef<BroadcastChannel|undefined>(undefined),boot=useRef(false);
 useEffect(()=>{if(boot.current)return;boot.current=true;fetch(new URL('catalog.json',document.baseURI)).then(r=>{if(!r.ok)throw Error('Bibliotheek niet beschikbaar. Open de app één keer online.');return r.json();}).then(async(c:Catalog)=>{ids.current=new Set(c.exercises.map(e=>e.id));const s=await openStorage(ids.current);ref.current=s;savedRevision.current=s.revision;setCatalog(c);setState(s);}).catch(e=>setFatal(`De lokale opslag of bibliotheek kan niet worden geopend. Bestaande gegevens zijn niet gewist. ${e.message}`));},[]);
 useEffect(()=>{const onHash=()=>{setScreen(location.hash.slice(1)||'vandaag');window.scrollTo(0,0);};const online=()=>setOffline(!navigator.onLine);const compare=async()=>{if(!ref.current)return;try{const latest=await readStorage(ids.current);if(latest.revision!==savedRevision.current)setStale(true);}catch(e){setError(String(e));}};const blocked=()=>{failed.current=true;setError('Opslag is geblokkeerd door een ander tabblad. Sluit andere tabbladen en herlaad.');};const unavailable=()=>setNotice('Offline opslag van de app kon niet worden voorbereid. Probeer opnieuw met internet.');window.addEventListener('hashchange',onHash);window.addEventListener('online',online);window.addEventListener('offline',online);window.addEventListener('focus',compare);window.addEventListener('storage-blocked',blocked);window.addEventListener('offline-unavailable',unavailable);if('BroadcastChannel' in window){channel.current=new BroadcastChannel('workout-changes');channel.current.onmessage=()=>void compare();}return ()=>{window.removeEventListener('hashchange',onHash);window.removeEventListener('online',online);window.removeEventListener('offline',online);window.removeEventListener('focus',compare);window.removeEventListener('storage-blocked',blocked);window.removeEventListener('offline-unavailable',unavailable);channel.current?.close();};},[]);
 useEffect(()=>{if(notice){const id=setTimeout(()=>setNotice(''),6500);return ()=>clearTimeout(id);}},[notice]);
 const go=(s:string)=>{location.hash=s;};
 const save=async(update:(s:State)=>State):Promise<boolean>=>{
  if(!ref.current)return false;
  let candidate:State;try{candidate=validateState(update(structuredClone(ref.current)),ids.current);}catch(e){setError((e as Error).message);return false;}
  ref.current=candidate;setState(candidate);setPending(n=>n+1);
  const run=async()=>{if(failed.current)throw Error('Niet opgeslagen. Exporteer je concept en laad de nieuwste gegevens voordat je verdergaat.');const next=await commitState(candidate,savedRevision.current,ids.current);savedRevision.current=next.revision;if(ref.current){ref.current={...ref.current,revision:next.revision};setState(ref.current);}setError('');channel.current?.postMessage(next.revision);return true;};
  const result=chain.current.then(run).catch(e=>{failed.current=true;setError(`Niet opgeslagen. ${(e as Error).message}`);return false;}).finally(()=>setPending(n=>n-1));chain.current=result;return result;
 };
 const confirm=(title:string,message:string,label='Bevestigen')=>new Promise<boolean>(resolve=>setQuestion({title,message,label,resolve}));
 const exportData=()=>{if(ref.current)download(exportBackup(ref.current),failed.current?'workout-niet-opgeslagen-concept.json':'workout-back-up.json');};
 const reload=async()=>{if(await confirm('Nieuwste gegevens laden?', 'Niet-opgeslagen wijzigingen worden vervangen. Exporteer eerst je concept als je dit wilt bewaren.','Gegevens laden')){try{const s=await readStorage(ids.current);ref.current=s;savedRevision.current=s.revision;failed.current=false;setState(s);setStale(false);setError('');}catch(e){setError((e as Error).message);}}};
 if(fatal)return <main className="startup"><Dumbbell size={40}/><h1>Gegevens niet beschikbaar</h1><p role="alert">{fatal}</p><button onClick={()=>location.reload()}>Opnieuw proberen</button><p className="muted">Wis geen browsergegevens als je lokale trainingen wilt behouden.</p></main>;
 if(!catalog||!state)return <main className="startup"><Dumbbell size={36}/><h1>Workout Tracker</h1><p role="status">Lokale trainingen openen…</p></main>;
 const stack=screen==='sessie'||screen==='instellingen',title=screen==='sessie'?'Actieve Sessie':screen==='instellingen'?'Instellingen':tabs.find(t=>t[0]===screen)?.[1]??'Vandaag';
 return <Context.Provider value={{state,catalog,save,go,confirm,notify:setNotice,exportData}}>
  <div className={`app ${screen==='vandaag'||screen==='sessie'?'deep':''} ${state.preferences.motion==='on'?'reduce-motion':''}`}>
   <a className="skip-link" href="#content" onClick={event=>{event.preventDefault();document.getElementById('content')?.focus();}}>Naar inhoud</a>
   <header><div className="header-inner"><div className="brand">{stack?<button className="icon-button" onClick={()=>go('vandaag')} aria-label="Terug naar Vandaag"><ArrowLeft/></button>:<span className="brand-icon"><Dumbbell size={23}/></span>}<div>{!stack&&<span className="eyebrow">Workout Tracker</span>}<h1>{title}</h1></div></div><div className="header-actions">{!stack&&<button className="icon-button" aria-label="Instellingen en back-up" onClick={()=>go('instellingen')}><SettingsIcon size={21}/></button>}<span className="avatar" title="Alleen lokaal · geen account"><UserRound size={21}/></span></div></div></header>
   <main id="content" tabIndex={-1}>
    <div className="save-status" role="status">{offline?'Offline · ':''}{pending?'Bezig met opslaan…':error?'Wijzigingen niet opgeslagen':stale?'Nieuwere gegevens in ander tabblad':'Lokaal opgeslagen'}</div>
    {(error||stale)&&<div className="storage-warning" role="alert"><p>{error||'Een ander tabblad heeft gegevens gewijzigd. Laad deze voordat je verdergaat.'}</p><div className="button-row"><button onClick={exportData}>Concept exporteren</button><button onClick={()=>void reload()}>Nieuwste laden</button></div></div>}
    {screen==='trainingen'?<Workouts/>:screen==='oefeningen'?<Library/>:screen==='voortgang'?<Progress/>:screen==='instellingen'?<Settings/>:screen==='sessie'?<SessionScreen/>:<Today/>}
   </main>
   {!stack&&<nav className="bottom-nav" aria-label="Hoofdnavigatie">{tabs.map(([id,label,Icon])=><a key={id} href={'#'+id} aria-current={screen===id?'page':undefined}><Icon size={21}/><span>{label}</span></a>)}</nav>}
   {notice&&<div className="toast" role="status">{notice}<button className="text-button" onClick={()=>setNotice('')}>Sluiten</button></div>}
   {question&&<Modal title={question.title} onClose={()=>{question.resolve(false);setQuestion(undefined);}}><p>{question.message}</p><div className="button-row"><button onClick={()=>{question.resolve(false);setQuestion(undefined);}}>Annuleren</button><button className="primary" onClick={()=>{question.resolve(true);setQuestion(undefined);}}>{question.label}</button></div></Modal>}
  </div>
 </Context.Provider>;
}
