import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity, AlertTriangle, BarChart3, Bell, Box, CalendarDays,
  CheckCircle2, ChevronRight, ClipboardCheck, Clock3, Command, FileBarChart,
  Gauge, LayoutDashboard, MapPin, Menu, PackageCheck, Plus, Search, Settings,
  ShieldCheck, Truck, Users, Wrench, X, Zap
} from 'lucide-react'
import './App.css'
import './investigation.css'
import { approveToolRun, createAssetRiskInvestigation, executeApprovedToolRun, rejectToolRun, proposeToolRun, appendDecisionToInvestigation, resetDeterministicIds, type Investigation } from './domain/investigation'
import { createSafeResponsePlan, recordDecisionPlan, type RecordedDecisionPlan, type SafeResponsePlan } from './domain/decision-plan'

type Status = 'Available' | 'In service' | 'Due soon' | 'Out of service'
type Asset = { id:string; name:string; type:string; location:string; operator:string; hours:number; health:number; status:Status; nextService:string }
type WorkOrder = { id:string; asset:string; title:string; priority:'Critical'|'High'|'Routine'; assignee:string; due:string; status:'Open'|'In progress'|'Waiting parts' }

const assets: Asset[] = [
  { id:'TRK-1042', name:'2022 Ford F-550', type:'Service truck', location:'Phoenix Yard', operator:'Maya Chen', hours:2841, health:91, status:'Available', nextService:'Sep 04' },
  { id:'EXC-221', name:'CAT 320 Excavator', type:'Heavy equipment', location:'Northstar Site', operator:'Luis Ortega', hours:6150, health:68, status:'Due soon', nextService:'Aug 24' },
  { id:'VAN-087', name:'2021 Transit 250', type:'Cargo van', location:'Denver Hub', operator:'—', hours:1806, health:96, status:'Available', nextService:'Oct 12' },
  { id:'TRL-443', name:'Big Tex 14TL', type:'Trailer', location:'Phoenix Yard', operator:'—', hours:982, health:43, status:'Out of service', nextService:'Overdue' },
  { id:'TRK-0998', name:'2020 Ram 3500', type:'Service truck', location:'Tucson Branch', operator:'Andre Cole', hours:4388, health:76, status:'In service', nextService:'Aug 29' },
  { id:'GEN-118', name:'Generac MLG20IF4', type:'Generator', location:'Northstar Site', operator:'—', hours:2350, health:88, status:'Available', nextService:'Sep 18' },
]
const orders: WorkOrder[] = [
  { id:'WO-24091', asset:'TRL-443', title:'Replace failed left brake assembly', priority:'Critical', assignee:'D. Foster', due:'Today · 2:00 PM', status:'In progress' },
  { id:'WO-24088', asset:'EXC-221', title:'500-hour preventive maintenance', priority:'High', assignee:'M. Patel', due:'Tomorrow', status:'Waiting parts' },
  { id:'WO-24082', asset:'TRK-0998', title:'Oil, filters, and safety inspection', priority:'Routine', assignee:'J. Ross', due:'Aug 29', status:'Open' },
]

const nav = [
  ['Mission control', LayoutDashboard], ['Assets', Truck], ['Work orders', Wrench],
  ['Inspections', ClipboardCheck], ['Parts & inventory', Box], ['People', Users],
  ['Reports', FileBarChart], ['Controls', ShieldCheck]
] as const

function Badge({children, tone='neutral'}:{children:React.ReactNode;tone?:string}) { return <span className={`badge ${tone}`}>{children}</span> }
function Health({value}:{value:number}) { return <div className="health"><div className="health-track"><i style={{width:`${value}%`}} /></div><b>{value}</b></div> }

function App() {
  const [page, setPage] = useState('Mission control')
  const [query, setQuery] = useState('')
  const [assetFilter, setAssetFilter] = useState<'All'|Status>('All')
  const [selected, setSelected] = useState<Asset|null>(null)
  const [commandOpen, setCommandOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [mobileNav, setMobileNav] = useState(false)
  const [investigation, setInvestigation] = useState<Investigation|null>(null)
  const [investigationKey, setInvestigationKey] = useState(0)
  const filtered = useMemo(() => assets.filter(a => (assetFilter==='All'||a.status===assetFilter) && `${a.id} ${a.name} ${a.location}`.toLowerCase().includes(query.toLowerCase())),[assetFilter,query])
  const act = (message:string) => { setNotice(`Simulated preview · ${message}`); window.setTimeout(()=>setNotice(''),2800) }

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen(true)
      }
      if (event.key === 'Escape') {
        setCommandOpen(false)
        setSelected(null)
        setMobileNav(false)
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  return <div className="app-shell">
    <header className="topbar">
      <button className="mobile-menu" aria-label="Toggle navigation" onClick={()=>setMobileNav(v=>!v)}><Menu size={19}/></button>
      <button className="wordmark" onClick={()=>setPage('Mission control')}><span>telemetry</span><b>x</b></button>
      <button className="global-search" onClick={()=>setCommandOpen(true)}><Search size={16}/><span>Search assets, work orders, people, and reports</span><kbd>⌘ K</kbd></button>
      <div className="top-actions"><button aria-label="System health"><Activity size={17}/><span className="live-dot"/></button><button aria-label="Notifications"><Bell size={17}/><i>3</i></button><div className="avatar">SW</div></div>
    </header>

    <aside className={mobileNav?'sidebar open':'sidebar'}>
      <div className="workspace"><div className="workspace-icon"><Zap size={17}/></div><div><b>3PM Operations</b><span>Synthetic demo workspace</span></div><ChevronRight size={15}/></div>
      <p className="nav-label">Operate</p>
      <nav aria-label="Operate">{nav.slice(0,6).map(([label,Icon])=><button key={label} aria-current={page===label?'page':undefined} className={page===label?'active':''} onClick={()=>{setPage(label);setMobileNav(false)}}><Icon size={17}/><span>{label}</span>{label==='Work orders'&&<em>12</em>}</button>)}</nav>
      <p className="nav-label">Understand</p>
      <nav aria-label="Understand">{nav.slice(6).map(([label,Icon])=><button key={label} aria-current={page===label?'page':undefined} className={page===label?'active':''} onClick={()=>{setPage(label);setMobileNav(false)}}><Icon size={17}/><span>{label}</span></button>)}</nav>
      <div className="agent-card"><div><Command size={15}/><b>Operations agent</b><Badge tone="success">Ready</Badge></div><p>Watching 146 assets. Two exceptions need a human decision.</p><button onClick={()=>act('Agent workbench opened')}>Open workbench <ChevronRight size={14}/></button></div>
      <button className="settings"><Settings size={16}/> Workspace settings</button>
    </aside>

    <main>
      <div className="demo-banner">Synthetic demonstration data · Actions are simulated · No production systems connected</div>
      {investigation ? <InvestigationWorkspace key={investigationKey} investigation={investigation} setInvestigation={setInvestigation} onClose={()=>setInvestigation(null)} onAction={act} onReset={()=>{resetDeterministicIds();setInvestigation(proposeToolRun(createAssetRiskInvestigation(),{tool:'Preferred vendor availability',purpose:'Verify brake assembly availability and delivery date',inputSummary:'BA-14TL brake assembly · deliver to Phoenix Yard'}));setInvestigationKey(k=>k+1)}}/> : page==='Mission control' ? <Dashboard onPage={setPage} onAsset={setSelected} onInvestigate={()=>setInvestigation(proposeToolRun(createAssetRiskInvestigation(),{tool:'Preferred vendor availability',purpose:'Verify brake assembly availability and delivery date',inputSummary:'BA-14TL brake assembly · deliver to Phoenix Yard'}))} onAction={act}/> : page==='Assets' ? <AssetsPage query={query} setQuery={setQuery} filter={assetFilter} setFilter={setAssetFilter} rows={filtered} onAsset={setSelected} onAction={act}/> : <DomainPage page={page} onAction={act}/>}
    </main>

    {selected && <AssetDrawer asset={selected} onClose={()=>setSelected(null)} onAction={act}/>}
    {commandOpen && <CommandPalette onClose={()=>setCommandOpen(false)} onPage={(p)=>{setPage(p);setCommandOpen(false)}} onAsset={(a)=>{setSelected(a);setCommandOpen(false)}}/>}
    {notice && <div className="toast" role="status" aria-live="polite"><CheckCircle2 size={17}/>{notice}</div>}
  </div>
}

function Dashboard({onPage,onAsset,onInvestigate,onAction}:{onPage:(p:string)=>void;onAsset:(a:Asset)=>void;onInvestigate:()=>void;onAction:(m:string)=>void}) {
 return <div className="page">
  <div className="page-head"><div><span className="eyebrow">Portfolio operating view</span><h1>Mission control</h1><p>Exceptions, priorities, and decisions across your fleet.</p></div><div className="head-actions"><button className="secondary" onClick={()=>onAction('Report snapshot prepared')}><FileBarChart size={16}/> Export snapshot</button><button className="primary" onClick={()=>onAction('New work order draft created')}><Plus size={16}/> New work order</button></div></div>
  <section className="kpi-grid">
    <button className="kpi" onClick={()=>onPage('Assets')}><span>Fleet availability <Badge tone="success">+1.8%</Badge></span><strong>94.6%</strong><p>138 of 146 assets ready</p><Gauge size={22}/></button>
    <button className="kpi" onClick={()=>onPage('Work orders')}><span>Open work orders <Badge tone="warning">4 due today</Badge></span><strong>12</strong><p>8 progressing on plan</p><Wrench size={22}/></button>
    <button className="kpi" onClick={()=>onPage('Inspections')}><span>Compliance readiness <Badge tone="success">On track</Badge></span><strong>97.2%</strong><p>3 inspections need review</p><ShieldCheck size={22}/></button>
    <button className="kpi" onClick={()=>onPage('Parts & inventory')}><span>Maintenance spend <Badge>MTD</Badge></span><strong>$84.2k</strong><p>4.1% below plan</p><BarChart3 size={22}/></button>
  </section>
  <div className="content-grid">
    <section className="panel priorities"><div className="panel-head"><div><h2>Priority queue</h2><p>Only work that needs a person’s attention</p></div><button className="link" onClick={()=>onPage('Work orders')}>View all <ChevronRight size={14}/></button></div>
      <div className="priority-card critical"><div className="priority-icon"><AlertTriangle size={18}/></div><div><span><Badge tone="danger">Safety critical</Badge><small>TRL-443 · Phoenix Yard</small></span><h3>Brake failure is blocking field deployment</h3><p>Investigate the risk with grounded evidence, visible tool use, and human approval.</p><div className="decision"><div className="avatars">DF</div><span><b>Decision owner</b>Dana Foster · due in 1h 24m</span></div></div><div className="card-actions"><button className="secondary" onClick={()=>onAsset(assets[3])}>Review asset</button><button className="primary" onClick={onInvestigate}>Investigate with agent</button></div></div>
      <div className="priority-card"><div className="priority-icon amber"><Clock3 size={18}/></div><div><span><Badge tone="warning">Service risk</Badge><small>EXC-221 · Northstar Site</small></span><h3>Planned maintenance waiting on hydraulic filter</h3><p>Current supplier delivery misses the maintenance window by two days.</p></div><div className="card-actions"><button className="secondary" onClick={()=>onAsset(assets[1])}>Open details</button></div></div>
    </section>
    <section className="panel utilization"><div className="panel-head"><div><h2>Fleet health</h2><p>Readiness by operating group</p></div><button className="icon-button"><CalendarDays size={16}/></button></div>
      {[['Phoenix',96,42],['Denver',94,34],['Tucson',91,29],['Northstar',87,41]].map(([n,v,c])=><div className="util-row" key={n}><div><b>{n}</b><span>{c} assets</span></div><div className="meter"><i style={{width:`${v}%`}}/></div><strong>{v}%</strong></div>)}
      <div className="insight"><Zap size={16}/><div><b>Agent insight</b><p>Northstar availability could recover 4 points by moving GEN-118 maintenance into Friday’s idle window.</p><button onClick={()=>onAction('Recommendation added to maintenance plan')}>Add to plan</button></div></div>
    </section>
  </div>
  <section className="panel table-panel"><div className="panel-head"><div><h2>Active work</h2><p>Maintenance currently affecting operations</p></div><button className="link" onClick={()=>onPage('Work orders')}>All work orders <ChevronRight size={14}/></button></div><WorkTable/></section>
 </div>
}

function InvestigationWorkspace({investigation,setInvestigation,onClose,onAction,onReset}:{investigation:Investigation;setInvestigation:(value:Investigation)=>void;onClose:()=>void;onAction:(message:string)=>void;onReset:()=>void}) {
 const tool=investigation.pendingToolRun
 const [plan,setPlan]=useState<SafeResponsePlan>(()=>createSafeResponsePlan())
 const [recorded,setRecorded]=useState<RecordedDecisionPlan|null>(null)
 const [rationale,setRationale]=useState('')
 const [rationaleError,setRationaleError]=useState('')
 const [optionError,setOptionError]=useState('')
 const approve=()=>setInvestigation(approveToolRun(investigation,'user-scott'))
 const reject=()=>setInvestigation(rejectToolRun(investigation,'user-scott','Use internal evidence only'))
 const run=()=>setInvestigation(executeApprovedToolRun(investigation,'Desert Fleet Supply · 1 BA-14TL available · delivery tomorrow by 10:30 AM · quoted $1,840'))
 const recordDecision=()=>{
   let hasError=false
   if (!plan.selectedOptionId) { setOptionError('Select a safe-response option before recording'); hasError=true } else setOptionError('')
   if (!rationale.trim()) { setRationaleError('Decision rationale is required'); hasError=true } else setRationaleError('')
   if (hasError) return
   try {
     const result=recordDecisionPlan(plan,{optionId:plan.selectedOptionId as 'expedite'|'reschedule',rationale,actorId:'user-dfoster',workOrderIntentId:'WO-24091',idempotencyKey:`decision:WO-24091:${plan.selectedOptionId}:v1`})
     setRecorded(result)
     setInvestigation(appendDecisionToInvestigation(investigation,result.decisionPlan))
   } catch {
     setOptionError('Recorded decision conflicts with this idempotency key; reset the demo to replay')
   }
 }
 return <div className="investigation-page"><header className="investigation-head"><button className="back-link" onClick={onClose}>← Mission control</button><div><span className="eyebrow">Active investigation · {investigation.assetId}</span><h1>{investigation.question}</h1><p>Human-led operating thread · every source, inference, approval, and result remains inspectable.</p></div><div className="head-side"><Badge tone={investigation.status==='Waiting approval'?'warning':investigation.status==='Ready for decision'?'success':'info'}>{investigation.status}</Badge><button className="secondary" onClick={onReset}>Reset demo</button></div></header>
 <div className="investigation-grid"><section className="investigation-thread"><article className="thread-turn"><div className="thread-avatar">SW</div><div><span>Scott Wayman · Fleet leader</span><p>{investigation.question}</p></div></article><article className="thread-turn agent-turn"><div className="thread-avatar agent-avatar"><Command size={16}/></div><div><span>TelemetryX operations agent</span><h2>Here is what the evidence says</h2><div className="truth-grid"><div><b>Facts</b>{investigation.facts.map(f=><p key={f}><CheckCircle2 size={13}/>{f}</p>)}</div><div><b>Interpretation</b>{investigation.inferences.map(i=><p key={i.statement}><Badge tone={i.confidence==='High'?'success':'warning'}>{i.confidence}</Badge><span>{i.statement}<small>{i.rationale}</small></span></p>)}</div></div><div className="recommendation"><Zap size={17}/><div><b>Recommended next move</b><p>{investigation.recommendation}</p></div></div></div></article>
 {tool&&<article className="tool-run"><div className="tool-run-head"><div><Activity size={17}/><span><b>{tool.tool}</b><small>External enrichment · synthetic adapter</small></span></div><Badge tone={tool.status==='Proposed'?'warning':tool.status==='Completed'?'success':'info'}>{tool.status}</Badge></div><dl><div><dt>Purpose</dt><dd>{tool.purpose}</dd></div><div><dt>Input</dt><dd>{tool.inputSummary}</dd></div></dl>{tool.status==='Proposed'&&<div className="approval-box"><div><ShieldCheck size={18}/><span><b>Human approval required</b><small>No external tool has run. Review the purpose and shared input.</small></span></div><div><button className="secondary" onClick={reject}>Reject</button><button className="primary" onClick={approve}>Approve lookup</button></div></div>}{tool.status==='Approved'&&<div className="approval-box approved"><div><CheckCircle2 size={18}/><span><b>Approved by Scott</b><small>Ready to run the synthetic vendor adapter.</small></span></div><button className="primary" onClick={run}>Run approved tool</button></div>}{tool.status==='Rejected'&&<div className="tool-result"><b>Rejected</b><p>{tool.rejectionReason}. No tool activity occurred.</p></div>}{tool.status==='Completed'&&!recorded&&<div className="tool-result"><b>Visible tool result</b><p>{tool.output}</p><section className="decision-panel" aria-labelledby="decision-plan-heading"><h2 id="decision-plan-heading">Safe response plan</h2><p className="decision-note">Synthetic decision only · no reservation, purchase, supplier contact, work assignment, repair, return to service, device command, or production integration.</p><fieldset className="decision-options" role="group" aria-labelledby="safe-response-option-legend"><legend id="safe-response-option-legend">Safe response option</legend>{plan.options.map(option=>(<label key={option.id} className="decision-option"><input type="radio" name="safe-response-option" checked={plan.selectedOptionId===option.id} onChange={()=>{setPlan({...plan,selectedOptionId:option.id});setOptionError('')}} aria-invalid={optionError?true:false} aria-describedby={optionError?'safe-response-option-error':undefined}/><span className="decision-option-body"><b>{option.label}</b><small>Trade-off: {option.tradeOff}</small><small>Evidence: {option.evidenceSummary}</small><small>Confidence: {option.confidence}</small><small>Quote freshness: {option.quoteFreshness}</small><small>Required approver: {option.requiredApprover}</small></span></label>))}{optionError&&<p id="safe-response-option-error" role="alert" style={{color:'#b42318',fontWeight:600}}>{optionError}</p>}</fieldset><div className="rationale-field"><label htmlFor="decision-rationale">Decision rationale</label><textarea id="decision-rationale" value={rationale} onChange={e=>setRationale(e.target.value)} rows={2}/>{rationaleError&&<p role="alert">{rationaleError}</p>}</div><button className="primary" onClick={recordDecision}>Record decision</button></section></div>}
          {recorded&&<div className="tool-result decision-recorded"><b>Decision recorded · {plan.options.find(o=>o.id===recorded.decisionPlan.selectedOptionId)?.label}</b><p>{recorded.decisionPlan.boundaryStatement}</p><p>Synthetic action · Reservation/purchase not executed. No supplier was contacted, nothing was assigned, repaired, or returned to service, and no device command was issued.</p><dl className="decision-audit"><div><dt>Linked work-order intent</dt><dd>WO-24091</dd></div><div><dt>Rationale</dt><dd>{recorded.events.at(-1)?.rationale}</dd></div><div><dt>Actor</dt><dd>{recorded.events.at(-1)?.actorId}</dd></div><div><dt>Recorded at</dt><dd>{recorded.events.at(-1)?.occurredAt}</dd></div><div><dt>Event</dt><dd>{recorded.events.at(-1)?.id}</dd></div></dl><button className="primary" onClick={()=>onAction('Decision plan recorded; no further synthetic actions were taken')}>Continue</button></div>}</article>}
 <div className="copilot-composer"><Command size={17}/><input aria-label="Steer the investigation" placeholder="Ask a follow-up, add context, or redirect the investigation…"/><button onClick={()=>onAction('Steering message previewed')}>Send</button></div></section><aside className="evidence-rail"><div className="rail-head"><h2>Grounding</h2><Badge>{investigation.evidence.length} sources</Badge></div>{investigation.evidence.map(e=><article className="evidence-card" key={e.id}><span><Badge tone={e.type==='Fact'?'success':'neutral'}>{e.type}</Badge><small>{e.source}</small></span><b>{e.label}</b><p>{e.value}</p><time>{new Date(e.observedAt).toLocaleString()}</time></article>)}<div className="memory-panel"><h2>Operating memory</h2>{investigation.timeline.map(e=><div key={e.id}><i/><span><b>{e.label}</b><small>{e.actorId}</small><small>{e.occurredAt}</small></span></div>)}</div></aside></div></div>
}

function WorkTable(){return <div className="table-wrap"><table><thead><tr><th>Work order</th><th>Asset</th><th>Priority</th><th>Owner</th><th>Due</th><th>Status</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td><b>{o.id}</b><span>{o.title}</span></td><td>{o.asset}</td><td><Badge tone={o.priority==='Critical'?'danger':o.priority==='High'?'warning':'neutral'}>{o.priority}</Badge></td><td>{o.assignee}</td><td>{o.due}</td><td><Badge tone={o.status==='In progress'?'info':'neutral'}>{o.status}</Badge></td></tr>)}</tbody></table></div>}

function AssetsPage({query,setQuery,filter,setFilter,rows,onAsset,onAction}:{query:string;setQuery:(q:string)=>void;filter:'All'|Status;setFilter:(s:'All'|Status)=>void;rows:Asset[];onAsset:(a:Asset)=>void;onAction:(m:string)=>void}) { const filters:(Status|'All')[]=['All','Available','In service','Due soon','Out of service']; return <div className="page"><div className="page-head"><div><span className="eyebrow">Asset registry</span><h1>Fleet assets</h1><p>A trusted operating record for every vehicle and piece of equipment.</p></div><div className="head-actions"><button className="secondary" onClick={()=>onAction('Asset import validation opened')}><PackageCheck size={16}/> Import</button><button className="primary" onClick={()=>onAction('New asset form opened')}><Plus size={16}/> Add asset</button></div></div>
 <section className="panel"><div className="asset-tools"><label><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search fleet assets"/></label><div className="filters">{filters.map(f=><button className={filter===f?'active':''} key={f} onClick={()=>setFilter(f)}>{f}</button>)}</div><span>{rows.length} assets</span></div>
 <div className="table-wrap"><table><thead><tr><th>Asset</th><th>Status</th><th>Location</th><th>Operator</th><th>Meter</th><th>Health</th><th>Next service</th></tr></thead><tbody>{rows.map(a=><tr key={a.id}><td><button className="asset-open" onClick={()=>onAsset(a)}><span className="asset-name"><span className="asset-icon"><Truck size={17}/></span><span><b>{a.name}</b><small>{a.id} · {a.type}</small></span></span></button></td><td><Badge tone={a.status==='Available'?'success':a.status==='Out of service'?'danger':a.status==='Due soon'?'warning':'info'}>{a.status}</Badge></td><td><span className="location"><MapPin size={13}/>{a.location}</span></td><td>{a.operator}</td><td>{a.hours.toLocaleString()} hrs</td><td><Health value={a.health}/></td><td>{a.nextService}</td></tr>)}</tbody></table></div></section></div> }

function DomainPage({page,onAction}:{page:string;onAction:(m:string)=>void}) { const info:Record<string,{icon:any;desc:string;stats:string[]}>={
 'Work orders':{icon:Wrench,desc:'Plan, approve, execute, and audit maintenance from request to return-to-service.',stats:['12 open orders','4 due today','82% on-time completion']},
 'Inspections':{icon:ClipboardCheck,desc:'Standardize inspections, defects, evidence, and compliance follow-through.',stats:['3 need review','97.2% compliant','18 completed today']},
 'Parts & inventory':{icon:Box,desc:'Keep the right parts available without trapping capital on the shelf.',stats:['$248k inventory value','7 reorder alerts','96% fill rate']},
 'People':{icon:Users,desc:'Connect operators, technicians, certifications, and accountability.',stats:['84 active people','6 credentials expiring','12 teams']},
 'Reports':{icon:FileBarChart,desc:'Turn trusted operating data into decisions, forecasts, and audit-ready evidence.',stats:['18 saved reports','4 scheduled briefs','Data current 2m ago']},
 'Controls':{icon:ShieldCheck,desc:'Govern access, approvals, data quality, and consequential actions.',stats:['24 active controls','0 critical findings','Last review Aug 20']}}
 const queues:Record<string,[string,string,string,string][]>={
  'Work orders':[['Critical','Replace failed left brake assembly','TRL-443 · Dana Foster','danger'],['High','500-hour preventive maintenance','EXC-221 · Mira Patel','warning'],['Routine','Oil, filters, and safety inspection','TRK-0998 · Jordan Ross','neutral']],
  'Inspections':[['Review','Brake defect evidence','TRL-443 · submitted 34m ago','danger'],['Due today','Daily operator inspection','TRK-1042 · Maya Chen','warning'],['Complete','Annual safety inspection','VAN-087 · evidence verified','success']],
  'Parts & inventory':[['Reorder','Hydraulic filter HF-320','Phoenix · 2 on hand','danger'],['External quote pending','Brake assembly BA-14TL','WO-24091 · no internal stock','warning'],['Healthy','Engine oil 15W-40','All locations · 96% fill rate','success']],
  'People':[['Expiring','CDL medical certificate','Andre Cole · 12 days','warning'],['Assignment','Northstar weekend coverage','2 technicians needed','neutral'],['Current','Safety training cohort','18 of 18 complete','success']],
  'Reports':[['Ready','Monthly fleet operating brief','August · synthetic snapshot','success'],['Scheduled','Maintenance variance review','Mondays · 8:00 AM','neutral'],['Draft','Lifecycle replacement forecast','6 assets need assumptions','warning']],
  'Controls':[['Review','Expedited-parts approval threshold','Owner · Dana Foster','warning'],['Passing','Asset status transition policy','24 cases evaluated','success'],['Draft','Agent recommendation boundary','Awaiting accountable owner','neutral']]}
 const d=info[page]||info.Reports, Icon=d.icon, queue=queues[page]||queues.Reports; return <div className="page"><div className="page-head"><div><span className="eyebrow">Operations workspace</span><h1>{page}</h1><p>{d.desc}</p></div><button className="primary" onClick={()=>onAction(`${page} creation flow previewed; no record was created`)}><Plus size={16}/> Preview create</button></div><div className="domain-hero"><Icon size={28}/><div>{d.stats.map(s=><span key={s}>{s}</span>)}</div></div><div className="content-grid"><section className="panel"><div className="panel-head"><div><h2>{page} queue</h2><p>Prioritized by impact, risk, and timing</p></div></div>{queue.map(([state,title,meta,tone])=><button className="queue-row" key={title} onClick={()=>onAction(`${title} detail preview opened`)}><div><Badge tone={tone}>{state}</Badge><b>{title}</b><span>{meta}</span></div><ChevronRight size={16}/></button>)}</section><section className="panel"><div className="panel-head"><div><h2>Agent brief</h2><p>Prepared from synthetic operating data</p></div></div><div className="agent-brief"><Command size={20}/><h3>Three opportunities are ready</h3><p>TelemetryX has grouped related exceptions and prepared next-best actions. Nothing consequential happens without an accountable person.</p><button className="primary" onClick={()=>onAction('Agent recommendations preview opened')}>Review recommendations</button></div></section></div></div> }

function AssetDrawer({asset,onClose,onAction}:{asset:Asset;onClose:()=>void;onAction:(m:string)=>void}) { const closeRef=useRef<HTMLButtonElement>(null); useEffect(()=>{const previous=document.activeElement as HTMLElement|null; closeRef.current?.focus(); return()=>previous?.focus()},[]); return <><div className="scrim" onClick={onClose}/><aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="asset-drawer-title"><div className="drawer-head"><div><span>{asset.id}</span><h2 id="asset-drawer-title">{asset.name}</h2></div><button ref={closeRef} aria-label="Close asset details" onClick={onClose}><X size={18}/></button></div><div className="asset-summary"><div className="asset-hero"><Truck size={30}/></div><div><Badge tone={asset.status==='Available'?'success':asset.status==='Out of service'?'danger':'warning'}>{asset.status}</Badge><p>{asset.type} · {asset.location}</p></div></div><div className="drawer-metrics"><div><span>Health score</span><strong>{asset.health}</strong><Health value={asset.health}/></div><div><span>Meter</span><strong>{asset.hours.toLocaleString()}</strong><small>engine hours</small></div><div><span>Next service</span><strong>{asset.nextService}</strong><small>preventive maintenance</small></div><div><span>Operator</span><strong className="small-strong">{asset.operator}</strong><small>current assignment</small></div></div><section><h3>Operating timeline</h3>{[['Today','Telematics health snapshot received'],['Aug 20','Daily inspection passed'],['Aug 16','Fuel transaction matched'],['Aug 02','Preventive maintenance closed']].map(([d,e])=><div className="timeline" key={e}><span>{d}</span><i/><p>{e}</p></div>)}</section><div className="drawer-actions"><button className="secondary" onClick={()=>onAction('Asset report prepared')}>Generate report</button><button className="primary" onClick={()=>onAction(`Work order draft created for ${asset.id}`)}>Create work order</button></div></aside></> }

function CommandPalette({onClose,onPage,onAsset}:{onClose:()=>void;onPage:(p:string)=>void;onAsset:(a:Asset)=>void}) { const [q,setQ]=useState(''); const matches=assets.filter(a=>`${a.id} ${a.name}`.toLowerCase().includes(q.toLowerCase())).slice(0,4); return <div className="command-scrim" onMouseDown={onClose}><div className="command" role="dialog" aria-modal="true" aria-label="Search and navigation" onMouseDown={e=>e.stopPropagation()}><label><Search size={18}/><span className="sr-only">Search or jump to</span><input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search or jump to…"/><button aria-label="Close search" onClick={onClose}>esc</button></label><p>Quick navigation</p><div className="command-grid">{nav.slice(0,6).map(([n,Icon])=><button key={n} onClick={()=>onPage(n)}><Icon size={16}/>{n}</button>)}</div>{q&&<><p>Assets</p>{matches.map(a=><button className="command-result" key={a.id} onClick={()=>onAsset(a)}><Truck size={16}/><span><b>{a.name}</b><small>{a.id} · {a.location}</small></span><ChevronRight size={15}/></button>)}</>}</div></div> }

export default App
