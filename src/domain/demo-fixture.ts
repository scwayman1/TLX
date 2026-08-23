// Neutral bounded fixture for the synthetic demo flow. It owns the two things
// every demo surface must agree on: one fixed clock instant, so reset/replay,
// close/reopen, and parallel instances produce identical audit records, and
// one synthetic persona, so displayed name, actor ID, approval record, and
// decision record can never drift apart. A fixture persona is not
// authentication; the qualifier below must stay visible wherever the persona
// acts. This module must not import from any domain module.

export const DEMO_CLOCK_ISO = '2026-08-21T15:00:00.000Z'

export const SYNTHETIC_PERSONA = Object.freeze({
  actorId: 'user-scott',
  name: 'Scott Wayman',
  role: 'Fleet leader',
  qualifier: 'synthetic persona — not authenticated',
})

export const SYNTHETIC_PERSONA_LABEL =
  `${SYNTHETIC_PERSONA.name} · ${SYNTHETIC_PERSONA.role} (${SYNTHETIC_PERSONA.qualifier})`
