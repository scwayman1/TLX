import { useMemo, useState } from 'react'
import {
  Activity, AlertTriangle, BarChart3, Bell, Box, CalendarDays,
  CheckCircle2, ChevronRight, ClipboardCheck, Clock3, Command, FileBarChart,
  Gauge, LayoutDashboard, MapPin, Menu, PackageCheck, Plus, Search, Settings,
  ShieldCheck, Truck, Users, Wrench, X, Zap
} from 'lucide-react'
import './App.css'

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
  const filtered = useMemo(() => assets.filter(a => (assetFilter==='All'||a.status===assetFilter) && `${a.id} ${a.name} ${a.location}`.toLowerCase().includes(query.toLowerCase())),[assetFilter,query])
  const act = (message:string) => { setNotice(message); window.setTimeout(()=>setNotice(''),2800) }

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
      <nav>{nav.slice(0,6).map(([label,Icon])=><button key={label} className={page===label?'active':''} onClick={()=>{setPage(label);setMobileNav(false)}}><Icon size={17}/><span>{label}</span>{label==='Work orders'&&<em>12</em>}</button>)}</nav>
      <p className="nav-label">Understand</p>
      <nav>{nav.slice(6).map(([label,Icon])=><button key={label} className={page===label?'active':''} onClick={()=>{setPage(label);setMobileNav(false)}}><Icon size={17}/><span>{label}</span></button>)}</nav>
      <div className="agent-card"><div><Command size={15}/><b>Operations agent</b><Badge tone="success">Ready</Badge></div><p>Watching 146 assets. Two exceptions need a human decision.</p><button onClick={()=>act('Agent workbench opened')}>Open workbench <ChevronRight size={14}/></button></div>
      <button className="settings"><Settings size={16}/> Workspace settings</button>
    </aside>

    <main>
      <div className="demo-banner">Synthetic demonstration data · No production systems connected</div>
      {page==='Mission control' ? <Dashboard onPage={setPage} onAsset={setSelected} onAction={act}/> : page==='Assets' ? <AssetsPage query={query} setQuery={setQuery} filter={assetFilter} setFilter={setAssetFilter} rows={filtered} onAsset={setSelected} onAction={act}/> : <DomainPage page={page} onAction={act}/>} 
    </main>

    {selected && <AssetDrawer asset={selected} onClose={()=>setSelected(null)} onAction={act}/>} 
    {commandOpen && <CommandPalette onClose={()=>setCommandOpen(false)} onPage={(p)=>{setPage(p);setCommandOpen(false)}} onAsset={(a)=>{setSelected(a);setCommandOpen(false)}}/>}
    {notice && <div className="toast"><CheckCircle2 size={17}/>{notice}</div>}
  </div>
}

function Dashboard({onPage,onAsset,onAction}:{onPage:(p:string)=>void;onAsset:(a:Asset)=>void;onAction:(m:string)=>void}) {
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
      <div className="priority-card critical"><div className="priority-icon"><AlertTriangle size={18}/></div><div><span><Badge tone="danger">Safety critical</Badge><small>TRL-443 · Phoenix Yard</small></span><h3>Brake failure is blocking field deployment</h3><p>Repair estimate is $1,840. Approve expedited parts to return the trailer to service tomorrow.</p><div className="decision"><div className="avatars">DF</div><span><b>Decision owner</b>Dana Foster · due in 1h 24m</span></div></div><div className="card-actions"><button className="secondary" onClick={()=>onAsset(assets[3])}>Review asset</button><button className="primary" onClick={()=>onAction('Expedited parts approved · audit event recorded')}>Approve $1,840</button></div></div>
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

function WorkTable(){return <div className="table-wrap"><table><thead><tr><th>Work order</th><th>Asset</th><th>Priority</th><th>Owner</th><th>Due</th><th>Status</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td><b>{o.id}</b><span>{o.title}</span></td><td>{o.asset}</td><td><Badge tone={o.priority==='Critical'?'danger':o.priority==='High'?'warning':'neutral'}>{o.priority}</Badge></td><td>{o.assignee}</td><td>{o.due}</td><td><Badge tone={o.status==='In progress'?'info':'neutral'}>{o.status}</Badge></td></tr>)}</tbody></table></div>}

function AssetsPage({query,setQuery,filter,setFilter,rows,onAsset,onAction}:{query:string;setQuery:(q:string)=>void;filter:'All'|Status;setFilter:(s:'All'|Status)=>void;rows:Asset[];onAsset:(a:Asset)=>void;onAction:(m:string)=>void}) { const filters:(Status|'All')[]=['All','Available','In service','Due soon','Out of service']; return <div className="page"><div className="page-head"><div><span className="eyebrow">Asset registry</span><h1>Fleet assets</h1><p>A trusted operating record for every vehicle and piece of equipment.</p></div><div className="head-actions"><button className="secondary" onClick={()=>onAction('Asset import validation opened')}><PackageCheck size={16}/> Import</button><button className="primary" onClick={()=>onAction('New asset form opened')}><Plus size={16}/> Add asset</button></div></div>
 <section className="panel"><div className="asset-tools"><label><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search fleet assets"/></label><div className="filters">{filters.map(f=><button className={filter===f?'active':''} key={f} onClick={()=>setFilter(f)}>{f}</button>)}</div><span>{rows.length} assets</span></div>
 <div className="table-wrap"><table><thead><tr><th>Asset</th><th>Status</th><th>Location</th><th>Operator</th><th>Meter</th><th>Health</th><th>Next service</th></tr></thead><tbody>{rows.map(a=><tr key={a.id} className="clickable" onClick={()=>onAsset(a)}><td><div className="asset-name"><div><Truck size={17}/></div><span><b>{a.name}</b><small>{a.id} · {a.type}</small></span></div></td><td><Badge tone={a.status==='Available'?'success':a.status==='Out of service'?'danger':a.status==='Due soon'?'warning':'info'}>{a.status}</Badge></td><td><span className="location"><MapPin size={13}/>{a.location}</span></td><td>{a.operator}</td><td>{a.hours.toLocaleString()} hrs</td><td><Health value={a.health}/></td><td>{a.nextService}</td></tr>)}</tbody></table></div></section></div> }

function DomainPage({page,onAction}:{page:string;onAction:(m:string)=>void}) { const info:Record<string,{icon:any;desc:string;stats:string[]}>={
 'Work orders':{icon:Wrench,desc:'Plan, approve, execute, and audit maintenance from request to return-to-service.',stats:['12 open orders','4 due today','82% on-time completion']},
 'Inspections':{icon:ClipboardCheck,desc:'Standardize inspections, defects, evidence, and compliance follow-through.',stats:['3 need review','97.2% compliant','18 completed today']},
 'Parts & inventory':{icon:Box,desc:'Keep the right parts available without trapping capital on the shelf.',stats:['$248k inventory value','7 reorder alerts','96% fill rate']},
 'People':{icon:Users,desc:'Connect operators, technicians, certifications, and accountability.',stats:['84 active people','6 credentials expiring','12 teams']},
 'Reports':{icon:FileBarChart,desc:'Turn trusted operating data into decisions, forecasts, and audit-ready evidence.',stats:['18 saved reports','4 scheduled briefs','Data current 2m ago']},
 'Controls':{icon:ShieldCheck,desc:'Govern access, approvals, data quality, and consequential actions.',stats:['24 active controls','0 critical findings','Last review Aug 20']}}
 const d=info[page]||info.Reports, Icon=d.icon; return <div className="page"><div className="page-head"><div><span className="eyebrow">Operations workspace</span><h1>{page}</h1><p>{d.desc}</p></div><button className="primary" onClick={()=>onAction(`New ${page.toLowerCase()} item created`)}><Plus size={16}/> Create new</button></div><div className="domain-hero"><Icon size={28}/><div>{d.stats.map(s=><span key={s}>{s}</span>)}</div></div><div className="content-grid"><section className="panel"><div className="panel-head"><div><h2>Operational queue</h2><p>Prioritized by impact, risk, and timing</p></div></div>{orders.map(o=><button className="queue-row" key={o.id} onClick={()=>onAction(`${o.id} opened`)}><div><Badge tone={o.priority==='Critical'?'danger':o.priority==='High'?'warning':'neutral'}>{o.priority}</Badge><b>{o.title}</b><span>{o.asset} · {o.assignee}</span></div><ChevronRight size={16}/></button>)}</section><section className="panel"><div className="panel-head"><div><h2>Agent brief</h2><p>Prepared from current operating data</p></div></div><div className="agent-brief"><Command size={20}/><h3>Three opportunities are ready</h3><p>TelemetryX has grouped related exceptions and prepared next-best actions. Nothing consequential happens without an accountable person.</p><button className="primary" onClick={()=>onAction('Agent recommendations opened')}>Review recommendations</button></div></section></div></div> }

function AssetDrawer({asset,onClose,onAction}:{asset:Asset;onClose:()=>void;onAction:(m:string)=>void}) { return <><div className="scrim" onClick={onClose}/><aside className="drawer"><div className="drawer-head"><div><span>{asset.id}</span><h2>{asset.name}</h2></div><button onClick={onClose}><X size={18}/></button></div><div className="asset-summary"><div className="asset-hero"><Truck size={30}/></div><div><Badge tone={asset.status==='Available'?'success':asset.status==='Out of service'?'danger':'warning'}>{asset.status}</Badge><p>{asset.type} · {asset.location}</p></div></div><div className="drawer-metrics"><div><span>Health score</span><strong>{asset.health}</strong><Health value={asset.health}/></div><div><span>Meter</span><strong>{asset.hours.toLocaleString()}</strong><small>engine hours</small></div><div><span>Next service</span><strong>{asset.nextService}</strong><small>preventive maintenance</small></div><div><span>Operator</span><strong className="small-strong">{asset.operator}</strong><small>current assignment</small></div></div><section><h3>Operating timeline</h3>{[['Today','Telematics health snapshot received'],['Aug 20','Daily inspection passed'],['Aug 16','Fuel transaction matched'],['Aug 02','Preventive maintenance closed']].map(([d,e])=><div className="timeline" key={e}><span>{d}</span><i/><p>{e}</p></div>)}</section><div className="drawer-actions"><button className="secondary" onClick={()=>onAction('Asset report prepared')}>Generate report</button><button className="primary" onClick={()=>onAction(`Work order draft created for ${asset.id}`)}>Create work order</button></div></aside></> }

function CommandPalette({onClose,onPage,onAsset}:{onClose:()=>void;onPage:(p:string)=>void;onAsset:(a:Asset)=>void}) { const [q,setQ]=useState(''); const matches=assets.filter(a=>`${a.id} ${a.name}`.toLowerCase().includes(q.toLowerCase())).slice(0,4); return <div className="command-scrim" onMouseDown={onClose}><div className="command" onMouseDown={e=>e.stopPropagation()}><label><Search size={18}/><input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search or jump to…"/><button onClick={onClose}>esc</button></label><p>Quick navigation</p><div className="command-grid">{nav.slice(0,6).map(([n,Icon])=><button key={n} onClick={()=>onPage(n)}><Icon size={16}/>{n}</button>)}</div>{q&&<><p>Assets</p>{matches.map(a=><button className="command-result" key={a.id} onClick={()=>onAsset(a)}><Truck size={16}/><span><b>{a.name}</b><small>{a.id} · {a.location}</small></span><ChevronRight size={15}/></button>)}</>}</div></div> }

export default App
