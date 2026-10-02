import fs from 'fs';
import path from 'path';

interface PublicResource {
  course: string;
  name: string;
  format: string;
  type: string;
  tags: string[];
  rlh: string;
}

export function validateIndex() {
  console.log('🔍 Running index validation...');
  const resourcesPath = path.resolve('src/data/resources.json');
  const coursesPath = path.resolve('src/data/courses.json');

  if (!fs.existsSync(resourcesPath)) {
    console.error('❌ Error: src/data/resources.json does not exist. Run npm run generate first.');
    process.exit(1);
  }

  const resources: PublicResource[] = JSON.parse(fs.readFileSync(resourcesPath, 'utf-8'));
  const courses = JSON.parse(fs.readFileSync(coursesPath, 'utf-8'));

  console.log(`Checking ${resources.length} resources across ${courses.length} courses...`);

  let errors = 0;
  const rlhSet = new Set<string>();

  for (let i = 0; i < resources.length; i++) {
    const item = resources[i];

    // Check required fields
    if (!item.course || typeof item.course !== 'string') {
      console.error(`❌ Record #${i}: Missing or invalid 'course'`);
      errors++;
    }
    if (!item.name || typeof item.name !== 'string') {
      console.error(`❌ Record #${i}: Missing or invalid 'name'`);
      errors++;
    }
    if (!item.format || typeof item.format !== 'string') {
      console.error(`❌ Record #${i}: Missing or invalid 'format'`);
      errors++;
    }
    if (!item.type || typeof item.type !== 'string') {
      console.error(`❌ Record #${i}: Missing or invalid 'type'`);
      errors++;
    }
    if (!item.rlh || !item.rlh.startsWith('r_')) {
      console.error(`❌ Record #${i}: Invalid RLH '${item.rlh}'`);
      errors++;
    }

    // Verify RLH uniqueness
    if (rlhSet.has(item.rlh)) {
      console.error(`❌ Record #${i}: Duplicate RLH collision detected: ${item.rlh}`);
      errors++;
    }
    rlhSet.add(item.rlh);

    // CRITICAL: Ensure NO forbidden fields exist
    const rawKeys = Object.keys(item);
    for (const forbidden of ['link', 'driveId', 'url', 'fileId', 'drive', 'webContentLink']) {
      if (rawKeys.includes(forbidden)) {
        console.error(`🚨 FATAL SECURITY LEAK: Record #${i} contains forbidden field '${forbidden}'!`);
        errors++;
      }
    }

    // Check if filename contains drive url
    if (item.name.includes('drive.google.com') || item.name.includes('googleusercontent.com')) {
      console.error(`🚨 Record #${i} filename contains drive URL!`);
      errors++;
    }
  }

  if (errors > 0) {
    console.error(`❌ Validation failed with ${errors} errors.`);
    process.exit(1);
  }

  console.log(`✅ Index validation passed: ${resources.length} clean sanitized records, 0 leaks.`);
}

if (process.argv[1] && process.argv[1].endsWith('validate-index.ts')) {
  validateIndex();
}
