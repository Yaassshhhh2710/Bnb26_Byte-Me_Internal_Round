import React,{useEffect,useMemo,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Mic,Square,Play,Plus,Minus,Settings,FileText,Clock3,Users,Radio,CheckCircle2,ChevronRight,Download,RotateCcw,MoreHorizontal,Activity,Lightbulb,Target,ListChecks} from 'lucide-react';
import './styles.css';

const seedLines=[
 {speaker:0,text:'Welcome everyone. Let’s get started with the project review.',time:'00:04'},
 {speaker:1,text:'I think the biggest thing we need to solve is the onboarding flow.',time:'00:12'},
 {speaker:2,text:'Agreed. We also need to decide who owns the analytics implementation.',time:'00:24'},
 {speaker:0,text:'Let’s make that a decision today and leave with clear owners.',time:'00:31'},
];
const colors=['#7c5cff','#22c55e','#f59e0b','#ef476f','#06b6d4'];

function App(){
 const [screen,setScreen]=useState('home'); const [count,setCount]=useState(3); const [names,setNames]=useState(['Speaker 1','Speaker 2','Speaker 3']);
 const [running,setRunning]=useState(false); const [elapsed,setElapsed]=useState(0); const [lines,setLines]=useState([]); const [active,setActive]=useState(0); const [demo,setDemo]=useState(true); const [topic,setTopic]=useState(''); const [speechError,setSpeechError]=useState('');
 const recognition=useRef(null); const timer=useRef(null);
 const runningRef=useRef(false); const elapsedRef=useRef(0); const activeRef=useRef(0); const countRef=useRef(count);
 useEffect(()=>{setNames(n=>Array.from({length:count},(_,i)=>n[i]||`Speaker ${i+1}`));countRef.current=count},[count]);
 useEffect(()=>{activeRef.current=active},[active]);
 useEffect(()=>{elapsedRef.current=elapsed},[elapsed]);
 useEffect(()=>{runningRef.current=running;if(!running)return; timer.current=setInterval(()=>setElapsed(e=>e+1),1000); return()=>clearInterval(timer.current)},[running]);
 useEffect(()=>()=>recognition.current?.stop(),[]);
 const time=useMemo(()=>`${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}`,[elapsed]);
 const start=()=>{
  setScreen('session');setRunning(true);runningRef.current=true;setElapsed(0);elapsedRef.current=0;setLines([]);setActive(0);activeRef.current=0;setSpeechError('');
  if(!demo && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)){
   const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
   const r=new SR();
   r.continuous=true;
   r.interimResults=true;
   r.lang='en-US';
   r.maxAlternatives=1;
   r.onresult=e=>{
    for(let i=e.resultIndex;i<e.results.length;i++){
     if(!e.results[i].isFinal) continue;
     const t=e.results[i][0].transcript.trim();
     if(!t) continue;
     const speaker=activeRef.current;
     setLines(x=>[...x,{speaker,text:t,time:fmt(elapsedRef.current)}]);
     const next=(speaker+1)%countRef.current;
     activeRef.current=next;
     setActive(next);
    }
   };
   r.onerror=e=>{
    console.error('Speech recognition error:',e.error,e.message);
    const messages={
     'not-allowed':'Microphone permission was blocked. Allow microphone access and reload.',
     'service-not-allowed':'Speech recognition service is blocked by the browser.',
     'audio-capture':'No working microphone was found.',
     'network':'Speech recognition could not reach the browser speech service. Check internet/HTTPS.',
     'no-speech':'No speech was detected. Try speaking closer to the microphone.'
    };
    if(e.error!=='no-speech') setSpeechError(messages[e.error]||`Speech recognition error: ${e.error}`);
   };
   r.onend=()=>{
    if(runningRef.current){
     try{r.start()}catch(err){console.warn('Recognition restart skipped:',err)}
    }
   };
   recognition.current=r;
   try{r.start()}catch(err){setSpeechError('Could not start speech recognition. Try Chrome/Edge on localhost or HTTPS.')}
  } else if(!demo){
   setSpeechError('This browser does not support Web Speech Recognition. Use Chrome or Edge.');
  } else {
   let i=0;
   const add=()=>{setLines(x=>[...x,{...seedLines[i%seedLines.length],speaker:i%countRef.current,time:fmt(elapsedRef.current)}]);setActive(i%countRef.current);activeRef.current=i%countRef.current;i++};
   add();timer.demo=setInterval(add,4200)
  }
 };
 const stop=()=>{runningRef.current=false;setRunning(false);clearInterval(timer.demo);recognition.current?.stop();recognition.current=null;setScreen('summary')};
 const reset=()=>{runningRef.current=false;setScreen('home');setRunning(false);setElapsed(0);setLines([]);clearInterval(timer.demo);recognition.current?.stop();recognition.current=null;setSpeechError('')};
 const fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
 if(screen==='home')return <Home count={count} setCount={setCount} names={names} setNames={setNames} topic={topic} setTopic={setTopic} demo={demo} setDemo={setDemo} start={start}/>;
 if(screen==='summary')return <Summary names={names} lines={lines} elapsed={elapsed} reset={reset}/>;
 return <Session names={names} lines={lines} running={running} active={active} time={time} stop={stop} setActive={setActive} topic={topic} speechError={speechError}/>;
}
function Header({onDocs}){return <header><div className="brand"><div className="brandMark"><Activity size={18}/></div><div><b>ROUNDTABLE</b><span>KNOW WHO SAID WHAT</span></div></div><div className="headerRight"><span className="demoPill">DEMO MODE</span><button className="ghost" onClick={onDocs}>Docs</button></div></header>}
function Home({count,setCount,names,setNames,topic,setTopic,demo,setDemo,start}){return <div className="app"><Header onDocs={()=>alert('ROUNDTABLE runs locally. Use Demo Mode for a no-API walkthrough, or turn it off to use browser speech recognition where supported.')}/><main className="hero"><div className="eyebrow"><span className="dot"></span> REAL-TIME MULTISPEAKER INTELLIGENCE</div><h1>Hear every voice.<br/><em>Know who said what.</em></h1><p className="sub">Live transcription with speaker diarization, topic detection, decision tracking, and AI summaries — designed for focused conversations.</p><div className="heroActions"><button className="primary big" onClick={start}><Mic size={19}/> Start New Session <ChevronRight size={18}/></button><button className="secondary big" onClick={()=>{setDemo(true);start()}}><Play size={18}/> View Demo Session</button></div>
<div className="setup"><div className="setupTop"><div><span className="label">SESSION SETUP</span><h2>Who’s at the table?</h2></div><div className="counter"><button onClick={()=>setCount(Math.max(3,count-1))}><Minus size={16}/></button><strong>{count}</strong><button onClick={()=>setCount(Math.min(5,count+1))}><Plus size={16}/></button></div></div><div className="speakerGrid">{names.map((n,i)=><div className="speakerInput" key={i}><span style={{background:colors[i]}}></span><input value={n} onChange={e=>setNames(a=>a.map((x,j)=>j===i?e.target.value:x))}/></div>)}</div><div className="topicRow"><div className="topicField"><FileText size={16}/><input placeholder="Session topic (optional)" value={topic} onChange={e=>setTopic(e.target.value)}/></div><label className="toggle"><input type="checkbox" checked={demo} onChange={e=>setDemo(e.target.checked)}/><span></span> Demo mode</label></div></div>
<div className="features"><Feature icon={<Users/>} title="Speaker Diarization" text="Automatic attribution with per-speaker color coding and live indicators."/><Feature icon={<Activity/>} title="Live Waveform" text="Canvas-style reactive audio visualization synced to the active speaker."/><Feature icon={<Lightbulb/>} title="AI Insights" text="Topics, decisions, action items, and post-session summary — structured."/></div></main></div>}
function Feature({icon,title,text}){return <div className="feature"><div className="featureIcon">{icon}</div><div><h3>{title}</h3><p>{text}</p></div></div>}
function Wave({active}){return <div className="wave">{Array.from({length:72},(_,i)=><i key={i} style={{height:`${10+Math.abs(Math.sin(i*.72))*32+(i%5)*5}px`,opacity:.3+(i%7)/10}}></i>)}<div className="waveGlow" style={{left:`${12+active*18}%`}}/></div>}
function Session({names,lines,running,active,time,stop,setActive,topic,speechError}){return <div className="app dark"><Header onDocs={()=>{}}/><div className="sessionBar"><div><span className="liveDot"></span>{running?'LIVE SESSION':'PAUSED'} <span className="sep">/</span> {topic||'Untitled conversation'}</div><div className="sessionTools"><span className="timer"><Clock3 size={15}/>{time}</span><button className="stop" onClick={stop}><Square size={15}/> End Session</button></div></div><main className="workspace"><section className="transcriptPanel"><div className="panelHead"><div><span className="label">LIVE TRANSCRIPT</span><h2>Conversation</h2></div><span className="tiny">{lines.length} utterances</span></div><div className="waveWrap"><Wave active={active}/><div className="waveCaption"><span>Listening for speakers…</span><span>{names[active]}</span></div></div><div className="speakerTabs">{names.map((n,i)=><button className={i===active?'active':''} key={i} onClick={()=>setActive(i)}><span style={{background:colors[i]}}></span>{n}</button>)}</div>{speechError&&<div style={{margin:'10px 22px',padding:'10px 12px',border:'1px solid #663642',background:'#211015',borderRadius:8,color:'#ff9eaa',fontSize:12}}>{speechError}</div>}<div className="transcript">{lines.length===0?<div className="empty"><Radio size={28}/><p>Waiting for conversation…</p><span>Start speaking to populate the transcript.</span></div>:lines.map((l,i)=><div className="utterance" key={i}><div className="avatar" style={{background:colors[l.speaker]}}>{l.speaker+1}</div><div><div className="uMeta"><b>{names[l.speaker]}</b><time>{l.time}</time></div><p>{l.text}</p></div></div>)}</div></section><aside className="insights"><div className="panelHead"><div><span className="label">SESSION INTELLIGENCE</span><h2>Insights</h2></div><button className="iconBtn"><MoreHorizontal size={18}/></button></div><Insight icon={<Target/>} title="Key Topics"><span className="tag">Onboarding</span><span className="tag">Analytics ownership</span></Insight><Insight icon={<CheckCircle2/>} title="Decisions"><div className="insightItem">Assign analytics implementation owner <small>Open</small></div></Insight><Insight icon={<ListChecks/>} title="Action Items"><div className="insightItem">Review onboarding flow with product team <small>Speaker 2</small></div><div className="insightItem">Confirm analytics owner <small>Speaker 3</small></div></Insight><div className="summaryCard"><span className="label">LIVE SUMMARY</span><p>The group is reviewing project onboarding and ownership. A decision is being made around the analytics implementation.</p></div></aside></main></div>}
function Insight({icon,title,children}){return <div className="insight"><div className="insightTitle">{icon}<b>{title}</b></div><div className="insightBody">{children}</div></div>}
function Summary({names,lines,elapsed,reset}){return <div className="app"><Header onDocs={()=>{}}/><main className="summary"><div className="summaryTop"><div><span className="label">SESSION COMPLETE</span><h1>Conversation summary</h1><p>{fmt2(elapsed)} · {lines.length} utterances · {names.length} speakers</p></div><div className="summaryActions"><button className="secondary" onClick={reset}><RotateCcw size={16}/> New Session</button><button className="primary" onClick={()=>window.print()}><Download size={16}/> Export</button></div></div><div className="summaryGrid"><div className="card"><span className="label">EXECUTIVE SUMMARY</span><h2>A focused discussion on onboarding and analytics ownership.</h2><p>The team identified the onboarding flow as a key problem area and agreed to establish clear ownership for the analytics implementation. The next step is to review the onboarding experience and confirm the implementation owner.</p></div><div className="card"><span className="label">SPEAKERS</span>{names.map((n,i)=><div className="speakerRow" key={i}><span style={{background:colors[i]}}></span><b>{n}</b><small>{lines.filter(x=>x.speaker===i).length} utterances</small></div>)}</div><div className="card wide"><span className="label">TRANSCRIPT</span>{lines.map((l,i)=><div className="sumLine" key={i}><b style={{color:colors[l.speaker]}}>{names[l.speaker]}</b><span>{l.text}</span><time>{l.time}</time></div>)}</div></div></main></div>}
function fmt2(s){return `${Math.floor(s/60)}m ${s%60}s`}
createRoot(document.getElementById('root')).render(<App/>);
