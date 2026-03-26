import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const CATEGORIES = [
  'garbage_collection',
  'water_leakage',
  'sewer_blockage',
  'drain_overflow',
  'streetlight',
  'pothole',
  'illegal_dumping',
  'mosquito_sanitation',
  'stray_animal',
  'park_maintenance',
  'encroachment',
];

const CATEGORY_DEPT: Record<string, string> = {
  garbage_collection: 'dept_001',
  water_leakage: 'dept_002',
  sewer_blockage: 'dept_002',
  drain_overflow: 'dept_002',
  streetlight: 'dept_003',
  pothole: 'dept_004',
  illegal_dumping: 'dept_001',
  mosquito_sanitation: 'dept_005',
  stray_animal: 'dept_006',
  park_maintenance: 'dept_005',
  encroachment: 'dept_007',
};

const WARDS = ['Ward 12 (Central)', 'Ward 7 (East)', 'Ward 3 (West)'];

// Status distribution: 5 submitted, 4 assigned, 6 in_progress, 5 resolved, 3 escalated, 2 overdue (status in_progress, sla breached) -> wait, overdue is just SLA in past. Let's make the 2 overdue be in "assigned" or "in_progress". The user said 2 overdue (sla_deadline in past). So total 25.
// Let's do exactly 25:
// 5 submitted, 4 assigned, 6 in_progress, 5 resolved, 3 escalated, 2 overdue (1 assigned, 1 in_progress)
const STATUSES = [
  ...Array(5).fill('submitted'),
  ...Array(3).fill('assigned'), // 3 normal assigned
  ...Array(5).fill('in_progress'), // 5 normal in_progress
  ...Array(5).fill('resolved'),
  ...Array(3).fill('escalated'),
  'assigned', // overdue
  'in_progress' // overdue
];

const OVERDUE_INDEXES = [STATUSES.length - 2, STATUSES.length - 1];

const REALISTIC_DATA = [
  { title: "Huge pile of garbage near market", location: "Connaught Place Block A", landmark: "Near Palika Bazaar", desc: "Garbage hasn't been collected for 4 days." },
  { title: "Continuous water pipe leak", location: "Lajpat Nagar II", landmark: "Central Market", desc: "Fresh drinking water is leaking onto the street." },
  { title: "Sewer line overflowing", location: "Saket Sector 3", landmark: "J Block", desc: "The main sewer line is blocked and spilling." },
  { title: "Drain clogged completely", location: "Karol Bagh", landmark: "Gaffar Market", desc: "Storm drain is full of plastic waste." },
  { title: "Streetlight not working", location: "Vasant Kunj C-8", landmark: "DDA Flats", desc: "Entire lane is dark, unsafe at night." },
  { title: "Dangerous pothole on main road", location: "Ring Road, South Ext", landmark: "AIIMS Flyover", desc: "Huge crater causing traffic jams." },
  { title: "Construction debris dumped", location: "Dwarka Sector 12", landmark: "Metro Station", desc: "Someone dumped rubble on the footpath overnight." },
  { title: "Mosquito breeding in stagnant water", location: "Mayur Vihar Phase 1", landmark: "Pocket A Park", desc: "Pool of water causing severe mosquito problem." },
  { title: "Aggressive stray dogs pack", location: "Hauz Khas Village", landmark: "Lake entrance", desc: "Pack of 6 dogs chasing vehicles." },
  { title: "Park benches broken and littered", location: "Lodhi Garden", landmark: "Gate 2", desc: "Maintenance required for the public park section." },
  { title: "Illegal shop extension", location: "Chandni Chowk", landmark: "Town Hall", desc: "Shopkeeper has completely blocked the walking path." },
];

function generateUid(index: number) {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(index).padStart(5, '0');
  return `NYC-${dateStr}-${seq}`;
}

async function main() {
  console.log('🌱 Starting Demo Seeding...');

  let { data: citizens, error: selE } = await supabase.from('users').select('id').eq('role', 'citizen').limit(1);
  if (selE) console.error('Select citizen error:', selE.message);

  let citizenId;
  if (!citizens || citizens.length === 0) {
    console.log('   Creating dummy citizen...');
    const { data: newCitizen, error: insErr } = await supabase.from('users').insert({
      phone: '9999999999',
      full_name: 'Demo Citizen',
      role: 'citizen'
    }).select('id').single();
    if (insErr) {
       require('fs').writeFileSync('insert-err.json', JSON.stringify(insErr, null, 2));
       console.error('Insert citizen err wrote to insert-err.json');
    }
    if (newCitizen) citizenId = newCitizen.id;
  } else {
    citizenId = citizens[0].id;
  }

  // 2. Ensure an officer exists
  let { data: officers } = await supabase.from('officers').select('id, user_id, department_id').limit(1);
  let officerId = officers && officers.length > 0 ? officers[0].id : null;

  if (!citizenId) {
    console.error('❌ Failed to get or create citizen.');
    process.exit(1);
  }

  console.log('   Inserting 25 complaints...');

  for (let i = 0; i < 25; i++) {
    const status = STATUSES[i];
    const category = CATEGORIES[i % CATEGORIES.length];
    const dataTemplate = REALISTIC_DATA[i % REALISTIC_DATA.length];
    const isOverdue = OVERDUE_INDEXES.includes(i);
    const ward = WARDS[i % WARDS.length];

    const now = new Date();
    // if overdue, set created_at and sla_deadline in past
    let created_at = new Date();
    let sla_deadline = new Date();
    
    // Add 24-168 hours to SLA based on category roughly. Let's just hardcode 48 hrs for demo
    if (isOverdue) {
      created_at.setDate(created_at.getDate() - 5);
      sla_deadline.setDate(sla_deadline.getDate() - 2); // 2 days overdue
    } else {
      sla_deadline.setDate(sla_deadline.getDate() + 2); // 2 days remaining
    }

    const { data: complaint, error: insertError } = await supabase.from('complaints').insert({
      complaint_uid: generateUid(i + 1),
      citizen_user_id: citizenId,
      title: dataTemplate.title,
      category: category,
      department_id: CATEGORY_DEPT[category],
      description: dataTemplate.desc,
      address: dataTemplate.location,
      landmark: dataTemplate.landmark,
      ward: ward,
      zone: 'Central Zone',
      status: status,
      urgency: 'medium',
      sla_deadline: sla_deadline.toISOString(),
      created_at: created_at.toISOString(),
      officer_id: (status !== 'submitted' && status !== 'verified') ? officerId : null
    }).select('id, created_at, status').single();

    if (insertError) {
      require('fs').writeFileSync('complaint-err.json', JSON.stringify(insertError, null, 2));
      console.error('❌ Error inserting complaint wrote to complaint-err.json');
      break;
    }

    // Add updates
    const updates = [];
    updates.push({
      complaint_id: complaint.id,
      new_status: 'submitted',
      updated_by_user_id: citizenId,
      created_at: created_at.toISOString(),
      public_note: 'Complaint filed successfully.'
    });

    if (status !== 'submitted') {
      const assignedDate = new Date(created_at);
      assignedDate.setHours(assignedDate.getHours() + 2);
      updates.push({
        complaint_id: complaint.id,
        new_status: 'assigned',
        updated_by_user_id: officerId,
        created_at: assignedDate.toISOString(),
        public_note: 'Assigned to nodal officer.'
      });
    }

    if (status === 'in_progress' || status === 'resolved' || status === 'escalated') {
      const inProgDate = new Date(created_at);
      inProgDate.setHours(inProgDate.getHours() + 10);
      updates.push({
        complaint_id: complaint.id,
        new_status: 'in_progress',
        updated_by_user_id: officerId,
        created_at: inProgDate.toISOString(),
        public_note: 'Work has commenced on site.'
      });
    }

    if (status === 'resolved') {
      const resDate = new Date(created_at);
      resDate.setHours(resDate.getHours() + 20);
      updates.push({
        complaint_id: complaint.id,
        new_status: 'resolved',
        updated_by_user_id: officerId,
        created_at: resDate.toISOString(),
        public_note: 'Issue resolved.'
      });
    }

    if (status === 'escalated') {
      const escDate = new Date(created_at);
      escDate.setHours(escDate.getHours() + 24);
      updates.push({
        complaint_id: complaint.id,
        new_status: 'escalated',
        updated_by_user_id: officerId,
        created_at: escDate.toISOString(),
        public_note: 'SLA breached. Escalated to higher authority.'
      });
    }

    const { error: updatesError } = await supabase.from('complaint_updates').insert(updates);
    if (updatesError) {
      console.error('❌ Error inserting updates:', updatesError);
    }
  }

  console.log('✅ Demo seeding completed successfully!');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
