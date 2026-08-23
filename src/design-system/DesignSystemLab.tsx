import { useState } from 'react'
import { AlertTriangle, Check, Clock3, LockKeyhole, MoreHorizontal, Search, ShieldAlert, X } from 'lucide-react'
import { ModalDialog } from './ModalDialog'
import './showcase.css'

type BadgeProps = { children: React.ReactNode; tone?: string }
const LabBadge = ({ children, tone = 'neutral' }: BadgeProps) => <span className={`badge ${tone}`}>{children}</span>

const states = [
  ['loading', 'Loading evidence', 'Retrieving synthetic evidence sources.', 'Progress is announced; existing context remains visible.'],
  ['empty', 'No matching assets', 'No synthetic assets match the current filters.', 'Clear filters'],
  ['error', 'Evidence unavailable', 'The synthetic inspection source could not be loaded. Nothing changed.', 'Retry'],
  ['stale', 'Stale evidence', 'Observed Aug 21 at 2:18 PM. Confirm freshness before deciding.', 'Refresh'],
  ['partial', 'Partial evidence', '3 of 4 synthetic sources available. Vendor coverage is missing.', 'Review available evidence'],
  ['permission', 'Permission required', 'Approval needs a fleet manager. Restricted data is not shown.', 'Return to queue'],
  ['success', 'Approval recorded', 'Scott approved the synthetic lookup. The tool has not run.', 'Continue'],
] as const

export function DesignSystemLab() {
  const [modalOpen, setModalOpen] = useState(false)
  const [motionActive, setMotionActive] = useState(false)

  return <div className="page lab-page">
    <header className="page-head lab-head">
      <div>
        <span className="eyebrow">Development / demo control</span>
        <h1>TelemetryX design system</h1>
        <p>Production primitives for an OPERATE-first fleet command surface.</p>
      </div>
      <LabBadge tone="warning">Synthetic component fixtures</LabBadge>
    </header>

    <div className="lab-boundary" role="note">
      <ShieldAlert size={18} />
      <div><strong>Component lab only</strong><span>All names, assets, states, and values below are synthetic UI fixtures. No customer data or live capability is represented.</span></div>
    </div>

    <nav className="lab-index" aria-label="Design system sections">
      {['Foundations', 'Actions & forms', 'Operational data', 'Shared states', 'Dialogs & motion'].map(item => <a key={item} href={`#${item.toLowerCase().replaceAll(' ', '-')}`}>{item}</a>)}
    </nav>

    <section id="foundations" className="lab-section">
      <div className="section-title"><span>01</span><div><h2>Foundations</h2><p>Color, contrast, type, and spacing encode calm hierarchy—not decoration.</p></div></div>
      <div className="swatch-grid" aria-label="Semantic color swatches">
        {[
          ['Canvas', '#F4F1E8', 'Graphite 14.36:1'], ['Surface', '#FFFEFA', 'Graphite 16.07:1'],
          ['Operational', '#185C43', 'White 7.92:1'], ['Success', '#E3F2E8', 'Forest 9.35:1'],
          ['Warning', '#FFF1D4', 'Brown 9.78:1'], ['Danger', '#FCE9E5', 'Red ink 9.57:1'],
          ['Information', '#E7F2F5', 'Blue ink 9.85:1'], ['Sparse signal', '#C7F04D', 'Graphite 12.36:1'],
        ].map(([name, color, contrast]) => <div className="swatch" key={name}><i style={{ background: color }} /><strong>{name}</strong><code>{color}</code><span>{contrast}</span></div>)}
      </div>
      <div className="type-specimen">
        <div><span>Display · 32/36</span><h1>Exception response</h1></div>
        <div><span>Heading · 24/29</span><h2>Evidence and ownership</h2></div>
        <div><span>Body · 15/23</span><p>Operators scan the signal, safety boundary, owner, and next action without losing provenance.</p></div>
        <div><span>Numeric · tabular</span><strong className="lab-number">94.6%</strong></div>
        <div><span>Identifier · mono</span><code>INV-TRL-443-01</code></div>
      </div>
      <div className="spacing-scale" aria-label="Spacing scale">
        {[4, 8, 12, 16, 24, 32, 48, 64].map(value => <div key={value}><i style={{ width: value }} /><span>{value}px</span></div>)}
      </div>
    </section>

    <section id="actions-&-forms" className="lab-section">
      <div className="section-title"><span>02</span><div><h2>Actions & forms</h2><p>One dominant action per decision region, explicit labels, and visible focus.</p></div></div>
      <div className="lab-columns">
        <div className="lab-card"><h3>Buttons</h3><div className="lab-actions"><button className="primary">Approve synthetic lookup</button><button className="secondary">Review evidence</button><button className="danger-button">Reject proposal</button><button disabled>Unavailable</button><button className="icon-button" aria-label="More fixture actions"><MoreHorizontal size={18} /></button></div></div>
        <form className="lab-card" onSubmit={event => event.preventDefault()}><h3>Form controls</h3><label>Search synthetic records<span className="field"><Search size={16} /><input placeholder="Asset, work order, owner" /></span></label><label>Decision owner<select defaultValue="Dana Foster"><option>Dana Foster</option></select></label><label>Rejection reason<textarea defaultValue="Use internal evidence only" /></label><span className="field-help">Required for the synthetic audit record.</span></form>
      </div>
      <div className="badge-line" aria-label="Status badge examples"><LabBadge>Open</LabBadge><LabBadge tone="info">In progress</LabBadge><LabBadge tone="success"><Check size={12} /> Available</LabBadge><LabBadge tone="warning"><Clock3 size={12} /> Stale</LabBadge><LabBadge tone="danger"><X size={12} /> Out of service</LabBadge></div>
    </section>

    <section id="operational-data" className="lab-section">
      <div className="section-title"><span>03</span><div><h2>Operational data</h2><p>Metrics and tables support decisions; evidence keeps its source and time.</p></div></div>
      <div className="instrument-strip">
        <div><span>Fleet availability</span><strong>94.6%</strong><small>138 of 146 synthetic assets ready</small></div>
        <div><span>Open work</span><strong>12</strong><small>4 synthetic orders due today</small></div>
        <div className="instrument-risk"><span>Safety exceptions</span><strong>1</strong><small>Named owner · response due</small></div>
      </div>
      <div className="table-wrap" role="region" aria-label="Synthetic component table" tabIndex={0}><table><thead><tr><th>Work order</th><th>Asset</th><th>Priority</th><th>Owner</th><th>Status</th></tr></thead><tbody><tr><td><b>WO-24091</b><span>Brake response fixture</span></td><td>TRL-443</td><td><LabBadge tone="danger">Critical</LabBadge></td><td>Dana Foster</td><td><LabBadge tone="info">In progress</LabBadge></td></tr><tr><td><b>WO-24088</b><span>Service fixture</span></td><td>EXC-221</td><td><LabBadge tone="warning">High</LabBadge></td><td>Mira Patel</td><td><LabBadge>Waiting parts</LabBadge></td></tr></tbody></table></div>
      <div className="evidence-fixtures"><article className="evidence-card"><span><LabBadge tone="success">Fact</LabBadge><small>Synthetic inspection INSP-8841</small></span><b>Brake inspection</b><p>Left brake assembly failed the fixture safety threshold.</p><time>Observed Aug 21, 2:18 PM</time></article><article className="decision-fixture"><div><ShieldAlert size={18} /><span><strong>Human approval required</strong><small>No external tool has run.</small></span></div><dl><div><dt>Input shared</dt><dd>BA-14TL · Phoenix Yard</dd></div><div><dt>Authority</dt><dd>Fleet manager</dd></div></dl><div className="lab-actions"><button className="secondary">Reject</button><button className="primary">Approve lookup</button></div></article></div>
    </section>

    <section id="shared-states" className="lab-section">
      <div className="section-title"><span>04</span><div><h2>Shared states</h2><p>Every state names what happened, what remains true, and the safe next step.</p></div></div>
      <div className="state-grid">{states.map(([tone, title, copy, action]) => <article className={`state-card state-${tone}`} key={tone} aria-busy={tone === 'loading' ? 'true' : undefined}><span>{tone === 'error' ? <AlertTriangle size={18} /> : tone === 'permission' ? <LockKeyhole size={18} /> : <span className="state-mark" />}</span><div><small>{tone}</small><h3>{title}</h3><p>{copy}</p><button className="link">{action}</button></div></article>)}</div>
      <div className="lab-banners"><div className="demo-banner">Synthetic demonstration data · Actions are simulated · No production systems connected</div><div className="safety-banner"><AlertTriangle size={18} /><span><strong>Safety boundary</strong>TRL-443 remains out of service. No device command will be issued.</span></div></div>
    </section>

    <section id="dialogs-&-motion" className="lab-section">
      <div className="section-title"><span>05</span><div><h2>Dialogs & motion</h2><p>Focus is contained and restored. Motion explains spatial change and respects reduced motion.</p></div></div>
      <div className="lab-card motion-card"><div><h3>Spatial state cue</h3><p>Activate to inspect the 180ms state transition. Reduced-motion preferences resolve it immediately.</p></div><button className="secondary" onClick={() => setMotionActive(value => !value)}>Toggle motion example</button><i className={motionActive ? 'motion-signal active' : 'motion-signal'} aria-label={motionActive ? 'Motion example active' : 'Motion example inactive'} /></div>
      <button className="primary" onClick={() => setModalOpen(true)}>Open focus example</button>
      {modalOpen && <ModalDialog title="Review synthetic approval" onClose={() => setModalOpen(false)}><div className="modal-body"><p>This example contains keyboard focus, closes with Escape, and restores focus to its opener.</p><div className="approval-summary"><span>Proposed action</span><strong>Run synthetic vendor lookup</strong><small>No supplier contact or purchase.</small></div><div className="modal-actions"><button className="secondary" onClick={() => setModalOpen(false)}>Cancel</button><button className="primary" onClick={() => setModalOpen(false)}>Acknowledge example</button></div></div></ModalDialog>}
    </section>
  </div>
}
