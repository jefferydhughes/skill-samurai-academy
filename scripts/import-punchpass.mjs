#!/usr/bin/env node
/**
 * import-punchpass.mjs
 *
 * Reusable Punchpass → Supabase import script.
 * Reads CSV exports from a folder and upserts data into the
 * skill-samurai-academy Supabase database.
 *
 * Usage:
 *   node scripts/import-punchpass.mjs --folder ./data/rouse-hill \
 *     --name "Skill Samurai Rouse Hill" --slug rouse-hill \
 *     --city "Rouse Hill" --state NSW --country Australia
 *
 * Or with a JSON config:
 *   node scripts/import-punchpass.mjs --config ./data/rouse-hill/config.json
 *
 * Requires:
 *   - .env.local in project root with VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *   - npm install csv-parse (dev dependency)
 */

import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import { readFileSync, readdirSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ─── Configuration ───────────────────────────────────────────────────────────

function loadEnv(projectRoot) {
  const envPath = join(projectRoot, '.env.local');
  const content = readFileSync(envPath, 'utf-8');
  const vars = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    // Strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    vars[key] = val;
  }
  return vars;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      opts[key] = args[i + 1] || true;
      i++;
    }
  }
  return opts;
}

function loadConfig(args) {
  if (args.config) {
    const raw = readFileSync(resolve(args.config), 'utf-8');
    return JSON.parse(raw);
  }

  if (!args.folder) {
    console.error('Error: --folder or --config is required');
    console.error('Usage: node scripts/import-punchpass.mjs --folder <path> --name <name> --slug <slug>');
    process.exit(1);
  }

  return {
    dataFolder: resolve(args.folder),
    location: {
      name: args.name || 'Unknown Location',
      slug: args.slug || 'unknown',
      city: args.city || '',
      state_province: args.state || '',
      country: args.country || 'Australia',
      timezone: args.timezone || 'Australia/Sydney',
    },
  };
}

// ─── CSV Helpers ─────────────────────────────────────────────────────────────

function findCsvFile(folder, pattern) {
  const files = readdirSync(folder);
  const match = files.find(f => f.toLowerCase().includes(pattern.toLowerCase()) && f.endsWith('.csv'));
  if (!match) return null;
  return join(folder, match);
}

function readCsv(filePath) {
  if (!filePath) return [];
  const content = readFileSync(filePath, 'utf-8');
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
    bom: true,
  });
}

// ─── Name Parsing ────────────────────────────────────────────────────────────

/**
 * Parses Punchpass "First Name" field into parent + student names.
 *
 * Examples:
 *   "Flynn (Michelle)"       → { parent: "Michelle", students: ["Flynn"] }
 *   "Alex, Benji (Samantha)" → { parent: "Samantha", students: ["Alex", "Benji"] }
 *   "Phyllis"                → { parent: null, students: ["Phyllis"] }
 */
function parseFirstName(rawFirstName) {
  if (!rawFirstName) return { parent: null, students: [] };

  const trimmed = rawFirstName.trim().replace(/^"|"$/g, '');

  // Match the last parenthetical group as parent name
  const parentMatch = trimmed.match(/^(.*?)\s*\(([^)]+)\)\s*$/);

  if (parentMatch) {
    const studentPart = parentMatch[1].trim();
    const parentName = parentMatch[2].trim();

    const students = studentPart
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    return { parent: parentName, students };
  }

  // No parentheses — treat as a single person (could be adult or solo student)
  const names = trimmed
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  return { parent: null, students: names };
}

/**
 * Cleans last name — some have parenthetical suffixes like "Bruce (Loh)".
 * Returns the part before parentheses.
 */
function cleanLastName(rawLastName) {
  if (!rawLastName) return '';
  const match = rawLastName.trim().match(/^([^(]+)/);
  return match ? match[1].trim() : rawLastName.trim();
}

// ─── Schedule Parsing ────────────────────────────────────────────────────────

const DAY_MAP = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
  Thursday: 4, Friday: 5, Saturday: 6,
};

/**
 * Parses "Monday at 16:00" → { weekday: 1, startTime: "16:00:00" }
 */
function parseScheduleTime(timeStr) {
  if (!timeStr) return null;
  const match = timeStr.trim().match(/^(\w+)\s+at\s+(\d{1,2}:\d{2})$/);
  if (!match) return null;
  const weekday = DAY_MAP[match[1]];
  if (weekday === undefined) return null;
  return {
    weekday,
    startTime: match[2].padStart(5, '0') + ':00',
  };
}

// ─── Date Parsing ────────────────────────────────────────────────────────────

function parseDate(str) {
  if (!str || str.trim() === '') return null;
  // Handle various date formats from Punchpass
  const trimmed = str.trim();
  // ISO format: 2026-03-01
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 10);
  }
  // US format: 03/01/2026
  const usMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (usMatch) {
    return `${usMatch[3]}-${usMatch[1].padStart(2, '0')}-${usMatch[2].padStart(2, '0')}`;
  }
  return trimmed;
}

function parsePrice(str) {
  if (!str || str.trim() === '') return null;
  // Remove currency symbols, commas, A$, $
  const cleaned = str.replace(/[A$,\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseBool(str) {
  if (!str) return false;
  return str.trim().toLowerCase() === 'true';
}

function parseInt2(str) {
  if (!str || str.trim() === '') return 0;
  const n = parseInt(str, 10);
  return isNaN(n) ? 0 : n;
}

// ─── Supabase Upsert Helpers ─────────────────────────────────────────────────

async function upsertBatch(supabase, table, rows, conflictColumns, batchSize = 500) {
  let total = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from(table)
      .upsert(batch, { onConflict: conflictColumns })
      .select('id');
    if (error) {
      console.error(`  Error upserting to ${table} (batch ${i / batchSize + 1}):`, error.message);
      throw error;
    }
    total += (data?.length || 0);
  }
  return total;
}

async function insertBatch(supabase, table, rows, batchSize = 500) {
  let total = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from(table)
      .insert(batch)
      .select('id');
    if (error) {
      console.error(`  Error inserting to ${table} (batch ${i / batchSize + 1}):`, error.message);
      throw error;
    }
    total += (data?.length || 0);
  }
  return total;
}

// ─── Main Import ─────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();
  const config = loadConfig(args);

  // Resolve project root (script is in <root>/scripts/)
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const projectRoot = resolve(__dirname, '..');
  const env = loadEnv(projectRoot);

  const supabaseUrl = env.VITE_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const folder = config.dataFolder;
  const loc = config.location;

  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Punchpass Import: ${loc.name}`);
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Folder: ${folder}`);
  console.log();

  const stats = {
    location: 0,
    programs: 0,
    instructors: 0,
    contacts: 0,
    students: 0,
    weeklySlots: 0,
    passPurchases: 0,
  };

  // ── Step 1: Upsert location ──────────────────────────────────────────────
  console.log('1. Upserting location...');
  const { data: locationData, error: locErr } = await supabase
    .from('franchise_locations')
    .upsert({
      name: loc.name,
      slug: loc.slug,
      city: loc.city,
      state_province: loc.state_province,
      country: loc.country,
      time_zone: loc.timezone,
      active: true,
    }, { onConflict: 'slug' })
    .select('id')
    .single();

  if (locErr) {
    console.error('  Error upserting location:', locErr.message);
    process.exit(1);
  }

  const locationId = locationData.id;
  stats.location = 1;
  console.log(`   Location: ${loc.name} (${locationId})`);

  // ── Step 2: Upsert programs ──────────────────────────────────────────────
  console.log('2. Upserting programs...');
  const programDefs = [
    { name: 'Coding Classes - All Ages/Levels', slug: 'coding-classes-all-levels', type: 'weekly' },
    { name: 'MathCode Mastery', slug: 'mathcode-mastery', type: 'weekly' },
  ];

  const programMap = {};
  for (const prog of programDefs) {
    const { data, error } = await supabase
      .from('programs')
      .upsert(prog, { onConflict: 'slug' })
      .select('id, slug')
      .single();
    if (error) {
      console.error(`  Error upserting program ${prog.name}:`, error.message);
      process.exit(1);
    }
    programMap[prog.name] = data.id;
    stats.programs++;
    console.log(`   Program: ${prog.name} (${data.id})`);
  }

  // ── Step 3: Import instructors ───────────────────────────────────────────
  console.log('3. Importing instructors...');
  const instructorFile = findCsvFile(folder, 'instructor');
  let adrianaId = null;

  if (instructorFile) {
    const instructorRows = readCsv(instructorFile);
    const instructorRecords = instructorRows.map(row => ({
      location_id: locationId,
      first_name: (row.Instructor || row.instructor || '').trim(),
      punchpass_name: (row.Instructor || row.instructor || '').trim(),
      classes_taught: parseInt2(row['# of Classes Taught'] || row['# of classes taught'] || '0'),
      total_attendances: parseInt2(row['# of Class Attendances'] || row['# of class attendances'] || '0'),
      is_active: true,
    }));

    if (instructorRecords.length > 0) {
      stats.instructors = await upsertBatch(supabase, 'instructors', instructorRecords, 'location_id,punchpass_name');
    }

    // Find Adriana for default assignment
    const { data: adrianaData } = await supabase
      .from('instructors')
      .select('id')
      .eq('location_id', locationId)
      .eq('punchpass_name', 'Adriana')
      .single();
    adrianaId = adrianaData?.id || null;

    console.log(`   Imported ${stats.instructors} instructors`);
    if (adrianaId) console.log(`   Default instructor: Adriana (${adrianaId})`);
  } else {
    console.log('   No instructor file found, skipping');
  }

  // ── Step 4: Import weekly class slots ────────────────────────────────────
  console.log('4. Importing weekly class slots...');
  const scheduleFile = findCsvFile(folder, 'summary by pass');

  if (scheduleFile) {
    const scheduleRows = readCsv(scheduleFile);
    const slotRecords = [];

    for (const row of scheduleRows) {
      const className = (row.Class || row.class || '').trim();
      const timeStr = (row.Time || row.time || '').trim();

      const parsed = parseScheduleTime(timeStr);
      if (!parsed) {
        console.log(`   Skipping unparseable time: "${timeStr}"`);
        continue;
      }

      const programId = programMap[className];
      if (!programId) {
        console.log(`   Skipping unknown program: "${className}"`);
        continue;
      }

      slotRecords.push({
        location_id: locationId,
        program_id: programId,
        instructor_id: adrianaId,  // Assign Adriana to all
        weekday: parsed.weekday,
        start_time: parsed.startTime,
        duration_minutes: 60,
        capacity: 12,
        age_min: 7,
        age_max: 17,
        title: className,
        active: true,
      });
    }

    if (slotRecords.length > 0) {
      // Delete existing Punchpass-imported slots for this location
      // (identified by matching program_ids from this import)
      const importedProgramIds = Object.values(programMap);
      for (const progId of importedProgramIds) {
        await supabase
          .from('weekly_class_slots')
          .delete()
          .eq('location_id', locationId)
          .eq('program_id', progId);
      }
      stats.weeklySlots = await insertBatch(supabase, 'weekly_class_slots', slotRecords);
    }

    console.log(`   Imported ${stats.weeklySlots} weekly class slots`);
  } else {
    console.log('   No schedule file found, skipping');
  }

  // ── Step 5: Import contacts + students ───────────────────────────────────
  console.log('5. Importing contacts and students...');
  const customerFile = findCsvFile(folder, 'active-customers') || findCsvFile(folder, 'customer');

  if (customerFile) {
    const customerRows = readCsv(customerFile);
    const contactRecords = [];
    const studentQueue = []; // { contactKey, students, birthday, healthStatus }

    for (const row of customerRows) {
      const rawFirstName = (row['First Name'] || '').trim();
      const rawLastName = (row['Last Name'] || '').trim();
      const lastName = cleanLastName(rawLastName);
      const { parent, students } = parseFirstName(rawFirstName);

      const customerId = (row['Customer Id'] || row['Customer ID'] || '').trim();
      if (!customerId) continue;

      const contact = {
        location_id: locationId,
        punchpass_customer_id: customerId,
        first_name: parent || (students.length > 0 ? students[0] : ''),
        last_name: lastName,
        raw_first_name: rawFirstName,
        email: (row.Email || '').trim() || null,
        phone: (row.Phone || '').trim() || null,
        street: (row.Street || '').trim() || null,
        city: (row.City || '').trim() || null,
        state: (row.State || '').trim() || null,
        zip_code: (row['Zip Code'] || '').trim() || null,
        country: (row.Country || '').trim() || 'AU',
        emergency_contact: (row['Emergency Contact'] || '').trim() || null,
        emergency_phone: (row['Emergency Phone'] || '').trim() || null,
        date_added: parseDate(row['Date Added']),
        last_attendance: parseDate(row['Last Attendance']),
        attendances_count: parseInt2(row['Attendances Count']),
        referral_source: (row['Referral Source'] || '').trim() || null,
        tags: (row.Tags || '').trim() || null,
        flagged: parseBool(row.Flagged),
        do_not_email: parseBool(row['Do Not Email']),
        notes: (row.Notes || '').trim() || null,
        status: 'active',
      };

      contactRecords.push(contact);

      // Queue student records
      studentQueue.push({
        punchpass_customer_id: customerId,
        students: students.length > 0 ? students : [contact.first_name],
        lastName,
        birthday: parseDate(row.Birthday),
        healthStatus: (row['Health Status'] || '').trim() || null,
      });
    }

    if (contactRecords.length > 0) {
      stats.contacts = await upsertBatch(supabase, 'contacts', contactRecords, 'location_id,punchpass_customer_id');
    }
    console.log(`   Imported ${stats.contacts} contacts`);

    // Now create student records (need contact IDs first)
    console.log('   Creating student records...');

    // Fetch all contact IDs for this location
    const { data: allContacts, error: fetchErr } = await supabase
      .from('contacts')
      .select('id, punchpass_customer_id')
      .eq('location_id', locationId);

    if (fetchErr) {
      console.error('  Error fetching contacts:', fetchErr.message);
    } else {
      const contactIdMap = {};
      for (const c of allContacts) {
        contactIdMap[c.punchpass_customer_id] = c.id;
      }

      // Delete existing students for this location to avoid duplicates on re-run
      const { error: delErr } = await supabase
        .from('students')
        .delete()
        .eq('location_id', locationId);
      if (delErr) {
        console.error('  Warning: could not clear existing students:', delErr.message);
      }

      const studentRecords = [];
      for (const q of studentQueue) {
        const contactId = contactIdMap[q.punchpass_customer_id];
        if (!contactId) continue;

        for (const studentName of q.students) {
          if (!studentName) continue;
          studentRecords.push({
            contact_id: contactId,
            location_id: locationId,
            first_name: studentName,
            last_name: q.lastName,
            full_name: `${studentName} ${q.lastName}`.trim(),
            dob: q.birthday || null,
            medical_allergies: q.healthStatus || null,
          });
        }
      }

      if (studentRecords.length > 0) {
        stats.students = await insertBatch(supabase, 'students', studentRecords);
      }
      console.log(`   Created ${stats.students} student records`);
    }
  } else {
    console.log('   No customer file found, skipping');
  }

  // ── Step 6: Import pass purchases ────────────────────────────────────────
  console.log('6. Importing pass purchases...');
  const passFile = findCsvFile(folder, 'pass purchases');

  if (passFile) {
    const passRows = readCsv(passFile);

    // Need contact IDs to link
    const { data: allContacts2 } = await supabase
      .from('contacts')
      .select('id, punchpass_customer_id')
      .eq('location_id', locationId);
    const contactIdMap2 = {};
    if (allContacts2) {
      for (const c of allContacts2) {
        contactIdMap2[c.punchpass_customer_id] = c.id;
      }
    }

    const passRecords = [];
    for (const row of passRows) {
      const customerId = (row['Customer ID'] || row['Customer Id'] || '').trim();
      const passId = (row['Pass ID'] || row['Pass Id'] || '').trim();
      if (!customerId || !passId) continue;

      passRecords.push({
        location_id: locationId,
        contact_id: contactIdMap2[customerId] || null,
        punchpass_customer_id: customerId,
        punchpass_pass_id: passId,
        pass_type: (row['Pass Type'] || '').trim() || null,
        pass_name: (row.Pass || '').trim() || null,
        purchased_date: parseDate(row.Purchased),
        expires_date: parseDate(row.Expires),
        punches: parseInt2(row.Punches),
        status: (row.Status || 'active').trim().toLowerCase(),
        price: parsePrice(row.Price),
        paid_with: (row['Paid with'] || '').trim() || null,
        customer_first_name: (row['First Name'] || '').trim() || null,
        customer_last_name: (row['Last Name'] || '').trim() || null,
        customer_email: (row['Customer Email'] || '').trim() || null,
        notes: (row.Notes || '').trim() || null,
      });
    }

    if (passRecords.length > 0) {
      stats.passPurchases = await upsertBatch(supabase, 'pass_purchases', passRecords, 'location_id,punchpass_pass_id');
    }
    console.log(`   Imported ${stats.passPurchases} pass purchases`);
  } else {
    console.log('   No pass purchases file found, skipping');
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log();
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Import Complete!');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Location:       ${stats.location}`);
  console.log(`  Programs:       ${stats.programs}`);
  console.log(`  Instructors:    ${stats.instructors}`);
  console.log(`  Weekly Slots:   ${stats.weeklySlots}`);
  console.log(`  Contacts:       ${stats.contacts}`);
  console.log(`  Students:       ${stats.students}`);
  console.log(`  Pass Purchases: ${stats.passPurchases}`);
  console.log('═══════════════════════════════════════════════════════');

  if (adrianaId) {
    console.log();
    console.log('  Note: All weekly class slots assigned to Adriana.');
    console.log('  Reassign via WeeklyScheduleManager UI as needed.');
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
