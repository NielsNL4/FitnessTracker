import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowLeftRight, Check, ChevronDown, Clock3, Hourglass, MinusCircle, Pause, Play, PlusCircle, SkipForward } from 'lucide-react';
import { useApp } from './context';
import { blankSet, describePlan, describeSet, extendTimer, finishSession, pauseTimer, previousValues, remaining, replaceEntry, resetTimer, resumeTimer, startTimer, validSet, type Entry, type SetLog } from './domain';
import { Empty, ExercisePicker, Field, Instructions, Media, Modal, timeLabel } from './ui';

export function SessionScreen() {
  const {state,catalog,save,go,confirm,notify}=useApp();
  const session=state.active;
  const [now,setNow]=useState(Date.now()),[replacing,setReplacing]=useState(false),[config,setConfig]=useState(false);
  const [duration,setDuration]=useState(90),[instructions,setInstructions]=useState(false),[validation,setValidation]=useState('');
  const signaled=useRef<string|undefined>(undefined);
  useEffect(()=>{const id=setInterval(()=>setNow(Date.now()),500);return ()=>clearInterval(id);},[]);
  useEffect(()=>{
    if(!session)return;
    const timer=session.timer;
    if(!timer.running||remaining(timer,now)!==0||signaled.current===String(timer.deadline))return;
    signaled.current=String(timer.deadline);
    notify('Rusttijd voorbij. Klaar voor je volgende set.');
    if(state.preferences.signal){
      navigator.vibrate?.([120,80,120]);
      try {
        const context=new AudioContext(),osc=context.createOscillator(),gain=context.createGain();
        gain.gain.value=.08;osc.connect(gain);gain.connect(context.destination);
        osc.frequency.value=660;osc.start();osc.stop(context.currentTime+.2);osc.onended=()=>void context.close();
      }catch{/* Browser may require a user gesture. */}
    }
    void save(s=>s.active?.id===session.id?{...s,active:{...s.active,timer:resetTimer()}}:s);
  },[now,session?.timer.deadline]);

  if(!session)return <><Empty>Geen actieve sessie. Kies een schema bij Trainingen.</Empty><button className="primary full" onClick={()=>go('trainingen')}>Kies een training</button></>;
  const entries=session.entries.filter(e=>!e.retired),entry=entries[session.current];
  const exercise=catalog.exercises.find(e=>e.id===entry.snapshot.exerciseId)!;
  const total=session.entries.reduce((n,e)=>n+e.sets.length,0),done=session.entries.reduce((n,e)=>n+e.sets.filter(s=>s.done).length,0);
  const rest=remaining(session.timer,now);
  const updateEntry=(fn:(e:Entry)=>Entry)=>save(s=>s.active?.id===session.id?{...s,active:{...s.active,entries:s.active.entries.map(e=>e.id===entry.id?fn(e):e)}}:s);
  const updateSet=(setId:string,key:keyof SetLog,value:number|null)=>{
    setValidation('');void updateEntry(e=>({...e,sets:e.sets.map(set=>set.id===setId?{...set,[key]:value,done:false}:set)}));
  };
  const check=async(set:SetLog)=>{
    if(!set.done&&!validSet(set,entry.mode)){
      setValidation(entry.mode==='strength'?'Vul een gewicht (0 mag) en hele, positieve herhalingen in.':entry.mode==='timed'?'Vul een positieve tijd in seconden in.':'Vul een positieve afstand in meters in.');
      return;
    }
    setValidation('');
    await save(s=>s.active?.id===session.id?{...s,active:{...s.active,entries:s.active.entries.map(e=>e.id===entry.id?{...e,sets:e.sets.map(x=>x.id===set.id?{...x,done:!set.done}:x)}:e),timer:!set.done?startTimer(entry.rest):s.active.timer}}:s);
  };
  const finish=async()=>{
    if(await confirm('Training afronden?',`${done} afgeronde sets worden bewaard in je geschiedenis. Niet-afgevinkte invoer telt niet mee.`, 'Afronden')){
      if(await save(s=>finishSession(s,session.id))){go('voortgang');notify('Training afgerond en lokaal opgeslagen.');}
    }
  };
  const abort=async()=>{
    if(await confirm('Training afbreken?','De volledige actieve sessie en alle sets daarin worden verwijderd. Je bestaande geschiedenis blijft bewaard.','Sessie verwijderen')){
      if(await save(s=>({...s,active:null})))go('vandaag');
    }
  };
  const navigate=(index:number)=>{setValidation('');setInstructions(false);void save(s=>s.active?{...s,active:{...s.active,current:index}}:s);};
  const number=(set:SetLog,key:'weight'|'reps'|'seconds'|'meters',label:string,max:number)=>(
    <input aria-label={`${label} set ${entry.sets.indexOf(set)+1}`} inputMode={key==='reps'?'numeric':'decimal'} type="number" min="0" max={max} step={key==='reps'?'1':'any'} value={set[key]??''} placeholder="–" onChange={e=>updateSet(set.id,key,e.target.value===''?null:Number(e.target.value))}/>
  );

  return <div className="session-screen">
    <section className="session-panel session-summary">
      <div className="section-head">
        <div className="session-title"><h2>{session.name}</h2><strong className="accent"><Clock3 size={20}/>{timeLabel(now-session.startedAt)}</strong></div>
        <button className="text-button muted" onClick={()=>void abort()}>Afbreken</button>
        <button className="primary compact-button" onClick={()=>void finish()}><Check size={18}/>Afronden</button>
      </div>
      <div className="section-head small"><span>Oefening {session.current+1} van {entries.length}</span><strong className="accent">{total?Math.round(done/total*100):0}% voltooid</strong></div>
      <div className="progress-track"><span style={{width:`${total?done/total*100:0}%`}}/></div>
    </section>
    <section className="session-panel current-exercise">
      <div className="section-head align-top">
        <div><span className="eyebrow">{entry.snapshot.muscles[0]}</span><h2>{entry.snapshot.name}</h2></div>
        <button className="outlined compact-button" onClick={()=>setReplacing(true)}><ArrowLeftRight size={16}/>Alternatief</button>
      </div>
      <p className="small muted session-plan">{describePlan(entry)}</p>
      <Media key={exercise.id} exercise={exercise}/>
      <button className="disclosure" aria-expanded={instructions} onClick={()=>setInstructions(!instructions)}>Instructies ({entry.snapshot.instructions.length} stappen, Engels)<ChevronDown size={18}/></button>
      {instructions&&<Instructions exercise={entry.snapshot}/>}
    </section>
    <section className="session-panel worksets">
      <div className="section-head"><h2>Werksets</h2><span className="badge">{entry.mode==='strength'?entry.unit:entry.mode==='timed'?'Seconden':entry.mode==='distance'?'Meters':'Zonder meting'}</span></div>
      <div className={`set-matrix mode-${entry.mode}`}>
        <div className="set-head"><span>Set</span><span>Vorige</span>
          {entry.mode==='strength'?<><span>{entry.unit}</span><span>Reps</span></>:entry.mode==='timed'?<span>Sec</span>:entry.mode==='distance'?<><span>Meters</span><span>Sec*</span></>:<span>Registratie</span>}
          <span>Klaar</span>
        </div>
        {entry.sets.map((set,i)=>{
          const previous=previousValues(state.history,entry,i);
          return <div className={`set-row ${set.done?'done':''}`} key={set.id}>
            <span className="set-index">{i+1}</span>
            <button className="previous-value" aria-label={`Vorige waarden overnemen set ${i+1}`} disabled={!previous||set.done||entry.mode==='completion'} title="Neem vorige waarden over; vink daarna zelf af" onClick={()=>{if(previous)void updateEntry(e=>({...e,sets:e.sets.map(x=>x.id===set.id?{...previous,id:x.id,done:false}:x)}));}}>{previous?describeSet(previous,entry.mode,entry.unit):'–'}</button>
            {entry.mode==='strength'?<>{number(set,'weight',entry.unit,3000)}{number(set,'reps','Herhalingen',10000)}</>:entry.mode==='timed'?number(set,'seconds','Seconden',86400):entry.mode==='distance'?<>{number(set,'meters','Meters',1000000)}{number(set,'seconds','Seconden (optioneel)',86400)}</>:<span className="small muted">Voltooien</span>}
            <button className="set-check" aria-label={`${set.done?'Maak ongedaan':'Voltooi'} set ${i+1}`} aria-pressed={set.done} onClick={()=>void check(set)}><Check size={23}/></button>
          </div>;
        })}
      </div>
      {entry.mode==='distance'&&<p className="small muted">* Tijd is optioneel, in seconden.</p>}
      {validation&&<p className="error-text" role="alert">{validation}</p>}
      <div className="button-row set-actions">
        <button disabled={entry.sets.length<=1} onClick={async()=>{const last=entry.sets.at(-1)!;if(last.done&&!await confirm('Afgeronde set verwijderen?','Deze gelogde set wordt uit de actieve sessie verwijderd.','Verwijderen'))return;void updateEntry(e=>({...e,sets:e.sets.slice(0,-1)}));}}><MinusCircle size={19}/>Set verwijderen</button>
        <button className="outlined" disabled={entry.sets.length>=100} onClick={()=>void updateEntry(e=>({...e,sets:[...e.sets,blankSet()]}))}><PlusCircle size={19}/>Set toevoegen</button>
      </div>
      <p className="small muted">Vorige = laatste compatibele afgeronde sets. Klik om over te nemen, niet om af te vinken.</p>
    </section>
    {session.entries.some(e=>e.retired&&e.sets.length>0)&&<p className="small muted">Afgeronde sets van vervangen oefeningen blijven met hun oorspronkelijke naam in deze sessie bewaard.</p>}
    <div className="session-navigation">
      <button disabled={session.current===0} onClick={()=>navigate(session.current-1)}><ArrowLeft size={20}/><span>Vorige{session.current>0?`: ${entries[session.current-1].snapshot.name}`:''}</span></button>
      <button className="primary" disabled={session.current===entries.length-1} onClick={()=>navigate(session.current+1)}><span>Volgende{session.current<entries.length-1?`: ${entries[session.current+1].snapshot.name}`:''}</span><ArrowRight size={20}/></button>
    </div>
    <aside className="rest-bar" aria-label="Rusttimer">
      <div className="timer-track"><span style={{width:`${session.timer.duration?Math.min(100,rest/session.timer.duration*100):0}%`}}/></div>
      <span className="round-icon"><Hourglass size={21}/></span>
      <button className="timer-config" onClick={()=>{setDuration(entry.rest);setConfig(true);}}><small>Rusttimer resterend</small><strong>{timeLabel(rest)}</strong><span>{entry.rest}s aanpassen</span></button>
      <button aria-label="30 seconden toevoegen" onClick={()=>void save(s=>s.active?{...s,active:{...s.active,timer:extendTimer(s.active.timer)}}:s)}>+30s</button>
      <button aria-label={session.timer.running?'Timer pauzeren':'Timer starten'} onClick={()=>void save(s=>s.active?{...s,active:{...s.active,timer:s.active.timer.running?pauseTimer(s.active.timer):remaining(s.active.timer)>0?resumeTimer(s.active.timer):startTimer(entry.rest)}}:s)}>{session.timer.running?<Pause size={20}/>:<Play size={20}/>}</button>
      <button aria-label="Rust overslaan" onClick={()=>void save(s=>s.active?{...s,active:{...s.active,timer:resetTimer()}}:s)}><SkipForward size={20}/></button>
    </aside>
    {replacing&&<ExercisePicker title="Oefening vervangen" preferredMuscle={entry.snapshot.muscles[0]} onClose={()=>setReplacing(false)} onSelect={async e=>{
      if(e.id===entry.snapshot.exerciseId)return;
      if(await confirm('Oefening vervangen?',`Afgeronde sets blijven bij ${entry.snapshot.name}. ${e.name} begint met lege sets; onvoltooide invoer van de oude oefening vervalt.`,'Vervangen')){
        if(await save(s=>s.active?{...s,active:replaceEntry(s.active,entry.id,e)}:s)){setReplacing(false);setInstructions(false);}
      }
    }}/>}
    {config&&<Modal title="Rusttimer aanpassen" onClose={()=>setConfig(false)}>
      <Field label="Rust in seconden (0–3600)"><input type="number" min="0" max="3600" value={duration} onChange={e=>setDuration(Number(e.target.value))}/></Field>
      <p className="small muted">Past de rust voor deze sessieoefening aan en start opnieuw. Browsergesloten alarmen zijn niet gegarandeerd.</p>
      {(!Number.isInteger(duration)||duration<0||duration>3600)&&<p className="error-text">Kies een geheel aantal tussen 0 en 3600.</p>}
      <button className="primary full" disabled={!Number.isInteger(duration)||duration<0||duration>3600} onClick={async()=>{
        if(await save(s=>s.active?{...s,active:{...s.active,entries:s.active.entries.map(e=>e.id===entry.id?{...e,rest:duration}:e),timer:startTimer(duration)}}:s))setConfig(false);
      }}>Instellen & starten</button>
    </Modal>}
  </div>;
}
