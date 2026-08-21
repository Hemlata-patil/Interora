import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zvbxdpasnmkvctcikllr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2YnhkcGFzbm1rdmN0Y2lrbGxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxOTY5ODYsImV4cCI6MjEwMjc3Mjk4Nn0.oXt60UnlugRPMWFIOiI1KIynoYP6QT9Elu7RhTMIWb0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const tables = [
  'profiles',
  'student_profiles',
  'company_profiles',
  'internship_postings',
  'student_applications',
  'attendance_records',
  'chat_conversations',
  'chat_participants',
  'chat_messages',
  'career_progress',
  'student_tasks',
  'student_milestones',
  'student_evaluations',
  'student_certificates',
  'faculty_student_assignments',
  'faculty_guidance_notes',
  'company_mentor_assignments',
  'company_task_reviews',
  'admin_ppo_approvals'
];

async function check() {
  console.log('--- AUDITING SUPABASE TABLES ---');
  for (const t of tables) {
    const res = await supabase.from(t).select('*').limit(1);
    if (res.error) {
      console.log(`[${t}] ERROR: ${res.error.message} (code: ${res.error.code})`);
    } else {
      console.log(`[${t}] SUCCESS: ${res.data ? res.data.length : 0} rows accessible`);
    }
  }

  console.log('\n--- CHECKING STORAGE BUCKETS ---');
  const buckets = await supabase.storage.listBuckets();
  if (buckets.error) {
    console.log('Buckets error:', buckets.error.message);
  } else {
    console.log('Buckets found:', (buckets.data || []).map(b => b.name));
  }
}

check();
