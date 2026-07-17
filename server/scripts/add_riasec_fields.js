/**
 * Script: add_riasec_fields.js
 * Adds holland_code, outcome_tags, and experience_tags to all careers in careers.json
 * Run: node scripts/add_riasec_fields.js
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const careersPath = join(__dirname, '../data/careers.json');

// Complete RIASEC + outcome + experience mapping for all 45 careers
const CAREER_META = {
  c_se:       { holland_code: ['I','R','C'], outcome_tags: ['income','technical','autonomy','stability'],    experience_tags: ['coding','research','math'] },
  c_ds:       { holland_code: ['I','R','C'], outcome_tags: ['income','technical','impact'],                  experience_tags: ['coding','research','math'] },
  c_med:      { holland_code: ['I','S','A'], outcome_tags: ['impact','status','stability'],                  experience_tags: ['healthcare','research','community'] },
  c_law:      { holland_code: ['E','C','S'], outcome_tags: ['income','status','autonomy'],                   experience_tags: ['debate','writing','research'] },
  c_acc:      { holland_code: ['C','I','E'], outcome_tags: ['income','stability','status'],                  experience_tags: ['math','business','research'] },
  c_mass:     { holland_code: ['A','S','E'], outcome_tags: ['creativity','impact','social'],                 experience_tags: ['writing','community','arts'] },
  c_econ:     { holland_code: ['I','E','C'], outcome_tags: ['income','impact','status'],                     experience_tags: ['research','math','business'] },
  c_civ:      { holland_code: ['R','I','C'], outcome_tags: ['impact','technical','stability'],               experience_tags: ['math','research','hands_on'] },
  c_nurs:     { holland_code: ['S','R','I'], outcome_tags: ['impact','social','stability'],                  experience_tags: ['healthcare','community','research'] },
  c_ba:       { holland_code: ['E','S','C'], outcome_tags: ['income','status','autonomy'],                   experience_tags: ['business','community','teaching'] },
  c_cyber:    { holland_code: ['I','R','C'], outcome_tags: ['income','technical','autonomy'],                experience_tags: ['coding','research','math'] },
  c_web:      { holland_code: ['I','A','R'], outcome_tags: ['income','creativity','autonomy'],               experience_tags: ['coding','design','research'] },
  c_ux:       { holland_code: ['A','I','R'], outcome_tags: ['creativity','income','social'],                 experience_tags: ['design','research','arts'] },
  c_pharm:    { holland_code: ['I','S','C'], outcome_tags: ['impact','stability','status'],                  experience_tags: ['healthcare','research','math'] },
  c_mech:     { holland_code: ['R','I','C'], outcome_tags: ['income','technical','stability'],               experience_tags: ['math','research','hands_on'] },
  c_agri:     { holland_code: ['R','I','S'], outcome_tags: ['impact','autonomy','technical'],                experience_tags: ['research','community','hands_on'] },
  c_fin:      { holland_code: ['I','C','E'], outcome_tags: ['income','status','technical'],                  experience_tags: ['math','research','business'] },
  c_hr:       { holland_code: ['S','E','C'], outcome_tags: ['social','stability','autonomy'],                experience_tags: ['community','business','teaching'] },
  c_geol:     { holland_code: ['I','R','E'], outcome_tags: ['income','technical','autonomy'],                experience_tags: ['research','math','hands_on'] },
  c_biotech:  { holland_code: ['I','R','S'], outcome_tags: ['impact','technical','stability'],               experience_tags: ['research','healthcare','math'] },
  c_edu:      { holland_code: ['S','E','I'], outcome_tags: ['impact','social','stability'],                  experience_tags: ['teaching','community','research'] },
  c_pr:       { holland_code: ['E','S','A'], outcome_tags: ['creativity','status','social'],                 experience_tags: ['writing','community','arts'] },
  c_mkt:      { holland_code: ['E','A','S'], outcome_tags: ['income','creativity','autonomy'],               experience_tags: ['writing','business','design'] },
  c_dba:      { holland_code: ['C','I','R'], outcome_tags: ['technical','stability','income'],               experience_tags: ['coding','math','research'] },
  c_net:      { holland_code: ['R','I','C'], outcome_tags: ['income','technical','stability'],               experience_tags: ['coding','math','research'] },
  c_rx:       { holland_code: ['I','R','C'], outcome_tags: ['technical','stability','impact'],               experience_tags: ['research','healthcare','math'] },
  c_dent:     { holland_code: ['R','I','S'], outcome_tags: ['income','status','impact'],                     experience_tags: ['healthcare','research','hands_on'] },
  c_chem_eng: { holland_code: ['R','I','C'], outcome_tags: ['income','technical','stability'],               experience_tags: ['math','research','hands_on'] },
  c_geo_eng:  { holland_code: ['R','I','C'], outcome_tags: ['technical','stability','impact'],               experience_tags: ['math','research','hands_on'] },
  c_env:      { holland_code: ['I','R','E'], outcome_tags: ['impact','autonomy','technical'],                experience_tags: ['research','community','hands_on'] },
  c_food:     { holland_code: ['I','R','C'], outcome_tags: ['technical','impact','stability'],               experience_tags: ['research','healthcare','hands_on'] },
  c_bank:     { holland_code: ['E','I','C'], outcome_tags: ['income','status','technical'],                  experience_tags: ['math','business','research'] },
  c_brand:    { holland_code: ['E','S','A'], outcome_tags: ['income','creativity','status'],                 experience_tags: ['business','writing','design'] },
  c_creative: { holland_code: ['A','E','I'], outcome_tags: ['creativity','autonomy','status'],               experience_tags: ['design','arts','writing'] },
  c_copy:     { holland_code: ['A','S','E'], outcome_tags: ['creativity','autonomy','income'],               experience_tags: ['writing','arts','business'] },
  c_pol:      { holland_code: ['E','I','S'], outcome_tags: ['impact','status','social'],                     experience_tags: ['research','debate','community'] },
  c_soc:      { holland_code: ['I','S','A'], outcome_tags: ['impact','social','stability'],                  experience_tags: ['research','community','writing'] },
  c_cloud:    { holland_code: ['I','R','C'], outcome_tags: ['income','technical','autonomy'],                experience_tags: ['coding','research','math'] },
  c_info:     { holland_code: ['C','I','R'], outcome_tags: ['technical','stability','income'],               experience_tags: ['coding','research','math'] },
  c_artist:   { holland_code: ['A','R','S'], outcome_tags: ['creativity','autonomy','social'],               experience_tags: ['arts','design','community'] },
  c_sound:    { holland_code: ['A','R','I'], outcome_tags: ['creativity','autonomy','income'],               experience_tags: ['arts','hands_on','research'] },
  c_director: { holland_code: ['A','S','E'], outcome_tags: ['creativity','social','status'],                 experience_tags: ['arts','community','debate'] },
  c_petrol:   { holland_code: ['R','I','E'], outcome_tags: ['income','technical','status'],                  experience_tags: ['math','research','hands_on'] },
  c_power:    { holland_code: ['R','I','C'], outcome_tags: ['impact','technical','stability'],               experience_tags: ['math','research','hands_on'] },
  c_counselor:{ holland_code: ['S','A','I'], outcome_tags: ['impact','social','stability'],                  experience_tags: ['community','teaching','healthcare'] },
  c_urban:    { holland_code: ['I','R','E'], outcome_tags: ['impact','technical','stability'],               experience_tags: ['research','math','community'] },
  c_biomed:   { holland_code: ['I','R','S'], outcome_tags: ['impact','technical','stability'],               experience_tags: ['research','healthcare','math'] },
  c_micro:    { holland_code: ['I','R','C'], outcome_tags: ['technical','impact','stability'],               experience_tags: ['research','healthcare','hands_on'] },
  c_forest:   { holland_code: ['R','I','S'], outcome_tags: ['impact','autonomy','social'],                   experience_tags: ['research','community','hands_on'] },
  c_vet:      { holland_code: ['R','I','S'], outcome_tags: ['impact','technical','stability'],               experience_tags: ['research','healthcare','hands_on'] },
};

// Read, patch, write
const careers = JSON.parse(readFileSync(careersPath, 'utf8'));

const updated = careers.map(career => {
  const meta = CAREER_META[career.id];
  if (!meta) {
    console.warn(`⚠️  No RIASEC meta found for career id: ${career.id}`);
    return career;
  }
  return {
    ...career,
    holland_code:    meta.holland_code,
    outcome_tags:    meta.outcome_tags,
    experience_tags: meta.experience_tags
  };
});

writeFileSync(careersPath, JSON.stringify(updated, null, 2));
console.log(`✅ RIASEC fields added to ${updated.length} careers in careers.json`);
