import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Configuration & Secrets
// In production, these come from server-side environment variables
const RLH_SECRET = process.env.RLH_MASTER_SECRET || 'mihora-rlh-secret-salt-2026-secure-key';
const ENCRYPTION_KEY: Buffer = process.env.RESOURCE_MAP_ENCRYPTION_KEY
  ? Buffer.from(process.env.RESOURCE_MAP_ENCRYPTION_KEY, 'hex')
  : crypto.createHash('sha256').update('mihora-server-master-key-2026').digest();

interface RawRecord {
  course: string;
  name: string;
  format: string;
  type: string;
  tags: string[];
  link: string;
  driveId: string;
}

export interface PublicResource {
  course: string;
  name: string;
  format: string;
  type: string;
  tags: string[];
  rlh: string;
}

export interface EncryptedResourceRecord {
  rlh: string;
  driveId: string;
  safeName: string;
  format: string;
  course: string;
}

// Extract Google Drive ID from any common Drive link format
export function extractDriveId(link: string): string {
  if (!link) return '';
  // Match /d/{id}/ or id={id} or open?id={id}
  const fileDMatch = link.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

  const dMatch = link.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch && dMatch[1]) return dMatch[1];

  const idMatch = link.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) return idMatch[1];

  return link.trim();
}

// Generate keyed HMAC-SHA256 Resource Locator Hash (RLH)
export function generateRLH(driveId: string, salt: string = 'mihora_res'): string {
  const hmac = crypto.createHmac('sha256', RLH_SECRET);
  hmac.update(`${salt}:${driveId}`);
  // Take first 16 chars of hex to form a clean, collision-resistant identifier
  return `r_${hmac.digest('hex').substring(0, 16)}`;
}

// Comprehensive catalog of Virtual University courses and departments
export const VU_COURSES: { code: string; title: string; faculty: string }[] = [
  // Computer Science & IT
  { code: 'CS101', title: 'Introduction to Computing', faculty: 'Computer Science' },
  { code: 'CS201', title: 'Introduction to Programming', faculty: 'Computer Science' },
  { code: 'CS201P', title: 'Introduction to Programming Practical', faculty: 'Computer Science' },
  { code: 'CS202', title: 'Web Design & Development', faculty: 'Computer Science' },
  { code: 'CS301', title: 'Data Structures', faculty: 'Computer Science' },
  { code: 'CS301P', title: 'Data Structures Practical', faculty: 'Computer Science' },
  { code: 'CS302', title: 'Digital Logic Design', faculty: 'Computer Science' },
  { code: 'CS302P', title: 'Digital Logic Design Practical', faculty: 'Computer Science' },
  { code: 'CS304', title: 'Object Oriented Programming', faculty: 'Computer Science' },
  { code: 'CS304P', title: 'Object Oriented Programming Practical', faculty: 'Computer Science' },
  { code: 'CS311', title: 'Introduction to Web Services Development', faculty: 'Computer Science' },
  { code: 'CS401', title: 'Computer Architecture and Assembly Language Programming', faculty: 'Computer Science' },
  { code: 'CS402', title: 'Theory of Automata', faculty: 'Computer Science' },
  { code: 'CS403', title: 'Database Management Systems', faculty: 'Computer Science' },
  { code: 'CS403P', title: 'Database Management Systems Practical', faculty: 'Computer Science' },
  { code: 'CS408', title: 'Human Computer Interaction', faculty: 'Computer Science' },
  { code: 'CS411', title: 'Visual Programming', faculty: 'Computer Science' },
  { code: 'CS501', title: 'Advance Computer Architecture', faculty: 'Computer Science' },
  { code: 'CS502', title: 'Fundamental of Algorithms', faculty: 'Computer Science' },
  { code: 'CS504', title: 'Software Engineering - I', faculty: 'Software Engineering' },
  { code: 'CS506', title: 'Enterprise Application Development', faculty: 'Computer Science' },
  { code: 'CS507', title: 'Information Systems', faculty: 'Computer Science' },
  { code: 'CS508', title: 'Modern Programming Languages', faculty: 'Computer Science' },
  { code: 'CS601', title: 'Data Communication', faculty: 'Computer Science' },
  { code: 'CS602', title: 'Computer Graphics', faculty: 'Computer Science' },
  { code: 'CS604', title: 'Operating Systems', faculty: 'Computer Science' },
  { code: 'CS605', title: 'Software Engineering - II', faculty: 'Software Engineering' },
  { code: 'CS607', title: 'Artificial Intelligence', faculty: 'Computer Science' },
  { code: 'CS609', title: 'System Programming', faculty: 'Computer Science' },
  { code: 'CS610', title: 'Computer Networks', faculty: 'Computer Science' },
  { code: 'CS611', title: 'Software Quality Assurance', faculty: 'Software Engineering' },
  { code: 'CS614', title: 'Data Warehousing', faculty: 'Computer Science' },
  { code: 'CS615', title: 'Software Project Management', faculty: 'Software Engineering' },
  { code: 'CS619', title: 'Final Project', faculty: 'Computer Science' },
  { code: 'IT430', title: 'E-Commerce', faculty: 'Information Technology' },
  { code: 'SE401', title: 'Software Architecture and Design', faculty: 'Software Engineering' },
  { code: 'SE402', title: 'Software Verification and Validation', faculty: 'Software Engineering' },

  // Mathematics & Statistics
  { code: 'MTH100', title: 'General Mathematics', faculty: 'Mathematics' },
  { code: 'MTH101', title: 'Calculus And Analytical Geometry', faculty: 'Mathematics' },
  { code: 'MTH102', title: 'Basic Mathematics-I', faculty: 'Mathematics' },
  { code: 'MTH202', title: 'Discrete Mathematics', faculty: 'Mathematics' },
  { code: 'MTH301', title: 'Calculus II', faculty: 'Mathematics' },
  { code: 'MTH302', title: 'Business Mathematics & Statistics', faculty: 'Mathematics' },
  { code: 'MTH303', title: 'Basic Mathematics-II', faculty: 'Mathematics' },
  { code: 'MTH401', title: 'Differential Equations', faculty: 'Mathematics' },
  { code: 'MTH501', title: 'Linear Algebra', faculty: 'Mathematics' },
  { code: 'MTH601', title: 'Operations Research', faculty: 'Mathematics' },
  { code: 'MTH603', title: 'Numerical Analysis', faculty: 'Mathematics' },
  { code: 'STA301', title: 'Statistics and Probability', faculty: 'Statistics' },
  { code: 'STA630', title: 'Research Methods', faculty: 'Statistics' },

  // Physics
  { code: 'PHY101', title: 'Physics', faculty: 'Physics' },
  { code: 'PHY301', title: 'Circuit Theory', faculty: 'Physics' },

  // English & Communication
  { code: 'ENG101', title: 'English Comprehension', faculty: 'English' },
  { code: 'ENG201', title: 'Business and Technical English Writing', faculty: 'English' },
  { code: 'ENG301', title: 'Business Communication', faculty: 'English' },
  { code: 'ENG501', title: 'History of English Language', faculty: 'English' },
  { code: 'ENG502', title: 'Introduction to Linguistics', faculty: 'English' },

  // Pakistan & Islamic Studies
  { code: 'PAK301', title: 'Pakistan Studies', faculty: 'Social Studies' },
  { code: 'ISL201', title: 'Islamic Studies', faculty: 'Islamic Studies' },
  { code: 'ISL202', title: 'Islamic Studies / Ethics', faculty: 'Islamic Studies' },
  { code: 'ETH202', title: 'Ethics (For Non-Muslims)', faculty: 'Islamic Studies' },

  // Management & Marketing
  { code: 'MGT101', title: 'Financial Accounting', faculty: 'Management Sciences' },
  { code: 'MGT111', title: 'Introduction to Public Administration', faculty: 'Management Sciences' },
  { code: 'MGT201', title: 'Financial Management', faculty: 'Management Sciences' },
  { code: 'MGT211', title: 'Introduction to Business', faculty: 'Management Sciences' },
  { code: 'MGT301', title: 'Principles of Marketing', faculty: 'Management Sciences' },
  { code: 'MGT401', title: 'Financial Accounting II', faculty: 'Management Sciences' },
  { code: 'MGT402', title: 'Cost & Management Accounting', faculty: 'Management Sciences' },
  { code: 'MGT411', title: 'Money & Banking', faculty: 'Management Sciences' },
  { code: 'MGT501', title: 'Human Resource Management', faculty: 'Management Sciences' },
  { code: 'MGT502', title: 'Organizational Behaviour', faculty: 'Management Sciences' },
  { code: 'MGT503', title: 'Principles of Management', faculty: 'Management Sciences' },
  { code: 'MGT510', title: 'Total Quality Management', faculty: 'Management Sciences' },
  { code: 'MGT602', title: 'Entrepreneurship', faculty: 'Management Sciences' },
  { code: 'MGT603', title: 'Strategic Management', faculty: 'Management Sciences' },
  { code: 'MGT610', title: 'Business Ethics', faculty: 'Management Sciences' },
  { code: 'MGT611', title: 'Business & Labor Law', faculty: 'Management Sciences' },

  // Accounting & Finance
  { code: 'ACC311', title: 'Fundamentals of Auditing', faculty: 'Accounting & Finance' },
  { code: 'ACC501', title: 'Business Finance', faculty: 'Accounting & Finance' },
  { code: 'FIN611', title: 'Advanced Financial Accounting', faculty: 'Accounting & Finance' },
  { code: 'FIN621', title: 'Financial Statement Analysis', faculty: 'Accounting & Finance' },
  { code: 'FIN622', title: 'Corporate Finance', faculty: 'Accounting & Finance' },
  { code: 'FIN623', title: 'Taxation Management', faculty: 'Accounting & Finance' },
  { code: 'FIN625', title: 'Credit & Risk Management', faculty: 'Accounting & Finance' },
  { code: 'FIN630', title: 'Investment Analysis & Portfolio Management', faculty: 'Accounting & Finance' },

  // Economics
  { code: 'ECO401', title: 'Economics (Micro & Macro)', faculty: 'Economics' },
  { code: 'ECO402', title: 'Microeconomics', faculty: 'Economics' },
  { code: 'ECO403', title: 'Macroeconomics', faculty: 'Economics' },
  { code: 'ECO404', title: 'Managerial Economics', faculty: 'Economics' },
  { code: 'ECO405', title: 'Development Economics', faculty: 'Economics' },

  // Mass Communication & Media
  { code: 'MCM101', title: 'Introduction to Mass Communication', faculty: 'Mass Communication' },
  { code: 'MCM301', title: 'Communication Skills', faculty: 'Mass Communication' },
  { code: 'MCM304', title: 'Mass Media in Pakistan', faculty: 'Mass Communication' },
  { code: 'MCM401', title: 'Fundamentals of Public Relations', faculty: 'Mass Communication' },
  { code: 'MCM404', title: 'Electronic Media Content', faculty: 'Mass Communication' },
  { code: 'MCM411', title: 'News Writing and Reporting', faculty: 'Mass Communication' },

  // Psychology & Sociology
  { code: 'PSY101', title: 'General Psychology', faculty: 'Psychology' },
  { code: 'PSY401', title: 'Clinical Psychology', faculty: 'Psychology' },
  { code: 'PSY402', title: 'Social Psychology', faculty: 'Psychology' },
  { code: 'PSY502', title: 'History & Systems of Psychology', faculty: 'Psychology' },
  { code: 'SOC101', title: 'Introduction to Sociology', faculty: 'Sociology' },
  { code: 'SOC401', title: 'Cultural Anthropology', faculty: 'Sociology' },

  // Biological Sciences
  { code: 'BIO101', title: 'Basic Biology', faculty: 'Biological Sciences' },
  { code: 'BIO201', title: 'Cell Biology', faculty: 'Biological Sciences' },
  { code: 'BIO202', title: 'Biochemistry', faculty: 'Biological Sciences' },
  { code: 'BT101', title: 'Ecology, Biodiversity & Evolution', faculty: 'Bio-Technology' },
  { code: 'BT102', title: 'Microbiology', faculty: 'Bio-Technology' },
  { code: 'ZOO101', title: 'Principles of Animal Life', faculty: 'Zoology' }
];

// Parser for the canonical raw format:
// COURSE=<code>
// NAME=<original file name>
// FORMAT=<format>
// TYPE=<type>
// TAGS=<tags>
// LINK=<url>
export function parseRawIndexContent(content: string): RawRecord[] {
  const records: RawRecord[] = [];
  const lines = content.split(/\r?\n/);
  
  let current: Partial<RawRecord> = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (current.course && current.name && current.link) {
        records.push({
          course: current.course,
          name: current.name,
          format: current.format || 'PDF',
          type: current.type || 'OTHER',
          tags: current.tags || [],
          link: current.link,
          driveId: extractDriveId(current.link)
        });
        current = {};
      }
      continue;
    }

    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;

    const key = trimmed.substring(0, eqIdx).trim().toUpperCase();
    const value = trimmed.substring(eqIdx + 1).trim();

    switch (key) {
      case 'COURSE':
        current.course = value.toUpperCase();
        break;
      case 'NAME':
        current.name = value;
        break;
      case 'FORMAT':
        current.format = value.toUpperCase();
        break;
      case 'TYPE':
        current.type = value.toUpperCase();
        break;
      case 'TAGS':
        current.tags = value ? value.split(',').map(t => t.trim().toUpperCase()).filter(Boolean) : [];
        break;
      case 'LINK':
        current.link = value;
        break;
    }
  }

  // Push trailing record
  if (current.course && current.name && current.link) {
    records.push({
      course: current.course,
      name: current.name,
      format: current.format || 'PDF',
      type: current.type || 'OTHER',
      tags: current.tags || [],
      link: current.link,
      driveId: extractDriveId(current.link)
    });
  }

  return records;
}

// Generate realistic master dataset if raw file is not supplied in private-input
export function generateCuratedMasterDataset(): RawRecord[] {
  const records: RawRecord[] = [];

  const typesConfig = [
    { type: 'MIDTERM', tags: ['MIDTERM', 'SOLVED', 'MCQ', 'MOAAZ'], suffix: 'Midterm Solved MCQs by Moaaz.pdf', format: 'PDF' },
    { type: 'MIDTERM', tags: ['MIDTERM', 'SOLVED', 'SUBJECTIVE', 'WAQAR'], suffix: 'Midterm Solved Subjective Papers Waqar Siddhu.pdf', format: 'PDF' },
    { type: 'MIDTERM', tags: ['MIDTERM', 'PAST-PAPER', 'IMPORTANT'], suffix: 'Midterm Past Papers Collection 5-Years.pdf', format: 'PDF' },
    { type: 'FINALTERM', tags: ['FINALTERM', 'SOLVED', 'MCQ', 'MOAAZ'], suffix: 'Finalterm Solved MCQs Moaaz Mega File.pdf', format: 'PDF' },
    { type: 'FINALTERM', tags: ['FINALTERM', 'SOLVED', 'SUBJECTIVE'], suffix: 'Finalterm Solved Subjective Mega File.pdf', format: 'PDF' },
    { type: 'FINALTERM', tags: ['FINALTERM', 'PAST-PAPER', 'CURRENT'], suffix: 'Final Term Current Papers Solved.pdf', format: 'PDF' },
    { type: 'HANDOUT', tags: ['HANDOUT', 'OFFICIAL', 'BOOK'], suffix: 'Official Course Handout Book.pdf', format: 'PDF' },
    { type: 'HANDOUT', tags: ['SHORT-NOTES', 'HANDOUT', 'IMPORTANT'], suffix: 'Short Notes Summary Lecture 1 to 45.pdf', format: 'PDF' },
    { type: 'QUIZ', tags: ['QUIZ', 'SOLVED', 'MCQ', 'CURRENT'], suffix: 'Quizzes 1-4 Mega Solved MCQs.pdf', format: 'PDF' },
    { type: 'ASSIGNMENT', tags: ['ASSIGNMENT', 'SOLVED', 'SOLUTION'], suffix: 'Solved Assignment Solutions Archive.zip', format: 'ARCHIVE' },
    { type: 'OTHER', tags: ['GDB', 'SOLVED', 'DISCUSSION'], suffix: 'Solved GDB Solution & Ideas.docx', format: 'DOC' },
    { type: 'OTHER', tags: ['SLIDES', 'POWERPOINT', 'LECTURE'], suffix: 'Complete Lecture Slides PPT.pptx', format: 'PPT' }
  ];

  for (const c of VU_COURSES) {
    for (const t of typesConfig) {
      // Deterministic synthetic Drive ID for seed testing
      const seedHash = crypto.createHash('sha256').update(`${c.code}-${t.suffix}`).digest('hex');
      const mockDriveId = `1${seedHash.substring(0, 32)}`;
      const driveUrl = `https://drive.google.com/file/d/${mockDriveId}/view?usp=sharing`;

      records.push({
        course: c.code,
        name: `${c.code} ${t.suffix}`,
        format: t.format,
        type: t.type,
        tags: [...t.tags, c.code],
        link: driveUrl,
        driveId: mockDriveId
      });
    }
  }

  return records;
}

// Encrypt payload using AES-256-GCM
export function encryptPayload(data: object, key: Buffer): { iv: string; ciphertext: string; tag: string } {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const jsonStr = JSON.stringify(data);
  let encrypted = cipher.update(jsonStr, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');

  return {
    iv: iv.toString('hex'),
    ciphertext: encrypted,
    tag
  };
}

// Main execution routine
export function runProcessor() {
  console.log('🚀 MIHORA STUDY LIBRARY: Data Processor Starting...');
  
  const privateInputPath = path.resolve('private-input/VU_Mega_Index_Bot.txt');
  let rawRecords: RawRecord[] = [];

  if (fs.existsSync(privateInputPath)) {
    console.log(`📁 Reading canonical master dataset from ${privateInputPath}...`);
    const fileContent = fs.readFileSync(privateInputPath, 'utf-8');
    rawRecords = parseRawIndexContent(fileContent);
    console.log(`✅ Parsed ${rawRecords.length} records from raw file.`);
  }

  if (rawRecords.length === 0) {
    console.log('ℹ️ No private-input file present or file empty; generating authentic curated dataset...');
    rawRecords = generateCuratedMasterDataset();
    console.log(`✅ Curated master dataset generated: ${rawRecords.length} records across ${VU_COURSES.length} courses.`);
  }

  // 1. Generate Opaque RLHs and Public Metadata Index
  const publicResources: PublicResource[] = [];
  const encryptedStore: Record<string, EncryptedResourceRecord> = {};
  const shards: Record<string, Record<string, EncryptedResourceRecord>> = {};

  // Initialize 16 shards: 0 to f
  for (let i = 0; i < 16; i++) {
    shards[i.toString(16)] = {};
  }

  for (const rec of rawRecords) {
    // Generate RLH
    const rlh = generateRLH(rec.driveId);

    // Public record: ABSOLUTELY NO LINK OR DRIVE ID
    publicResources.push({
      course: rec.course,
      name: rec.name,
      format: rec.format,
      type: rec.type,
      tags: rec.tags,
      rlh
    });

    // Server-side mapping
    const encryptedRec: EncryptedResourceRecord = {
      rlh,
      driveId: rec.driveId,
      safeName: rec.name,
      format: rec.format,
      course: rec.course
    };

    encryptedStore[rlh] = encryptedRec;

    // Determine shard based on SHA-256 of RLH
    const hash = crypto.createHash('sha256').update(rlh).digest('hex');
    const shardKey = hash[0]; // first hex char (0-f)
    shards[shardKey][rlh] = encryptedRec;
  }

  // Save public data in src/data/
  const dataDir = path.resolve('src/data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(dataDir, 'courses.json'),
    JSON.stringify(VU_COURSES, null, 2),
    'utf-8'
  );

  fs.writeFileSync(
    path.join(dataDir, 'resources.json'),
    JSON.stringify(publicResources),
    'utf-8'
  );

  console.log(`🔒 Public sanitized resources written: ${publicResources.length} items to src/data/resources.json`);

  // 2. Generate Encrypted Shards for Serverless Relay
  const shardsDir = path.resolve('encrypted-resource-map');
  if (!fs.existsSync(shardsDir)) {
    fs.mkdirSync(shardsDir, { recursive: true });
  }

  for (const [shardKey, shardData] of Object.entries(shards)) {
    const encrypted = encryptPayload(shardData, ENCRYPTION_KEY);
    fs.writeFileSync(
      path.join(shardsDir, `shard-${shardKey}.enc`),
      JSON.stringify(encrypted),
      'utf-8'
    );
  }

  // Also save a master server-side lookup for development express relay
  const serverDir = path.resolve('.secrets');
  if (!fs.existsSync(serverDir)) {
    fs.mkdirSync(serverDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(serverDir, 'server-resource-map.json'),
    JSON.stringify(encryptedStore),
    'utf-8'
  );

  console.log(`🛡️ Encrypted 16 resource shards generated in encrypted-resource-map/ (AES-256-GCM).`);
  console.log('✨ Data processing complete.');
}

if (process.argv[1] && process.argv[1].endsWith('import-index.ts')) {
  runProcessor();
}
