import { CHARACTERS } from '../data/characters';
import { EVIDENCE } from '../data/evidence';
import { MOMENTS, SOLUTION } from '../data/case';
import { GameState } from './state';

/**
 * Dev-only helpers. Exposed on window.__ME in development so the full
 * ending can be verified without a 25-minute replay after each tweak.
 */
export function grantMinimumPath(): void {
  const flags = [
    'met_bram',
    'met_ilse',
    'met_kass',
    'met_nadia',
    'interviewed_bram',
    'interviewed_ilse',
    'interviewed_kass',
    'interviewed_nadia',
    'bram_alibi',
    'bram_ren',
    'baggage_unlocked',
    'ilse_alibi',
    'ilse_told_truth',
    'kass_alibi',
    'nadia_alibi',
    'know_mop',
    'know_nadia_seen',
    'know_costume',
    'ready_for_reconstruction',
    'c1_done',
    'c2_done',
    'c3_done',
    'bram_told_truth',
    'kass_told_truth',
  ];
  for (const f of flags) GameState.setFlag(f);
  for (const e of EVIDENCE) GameState.addEvidence(e.id);
  GameState.addStatement('bram_patrol');
  GameState.addStatement('bram_sleeping');
  GameState.addStatement('ilse_galley');
  GameState.addStatement('ilse_figure');
  GameState.addStatement('kass_knocking');
  GameState.addStatement('kass_crate');
  GameState.addStatement('nadia_seat');
  for (const c of CHARACTERS) {
    for (const m of MOMENTS) {
      GameState.setRecon(c.id, m.id, SOLUTION[c.id][m.id]);
    }
  }
  GameState.setFlag('recon_solved');
  GameState.checkMilestones();
  GameState.save();
}

export function attachDebug(): void {
  if (!import.meta.env.DEV) return;
  (window as unknown as { __ME: typeof GameState; __ME_grant: typeof grantMinimumPath }).__ME =
    GameState;
  (window as unknown as { __ME_grant: typeof grantMinimumPath }).__ME_grant = grantMinimumPath;
}
