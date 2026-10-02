import fs from 'fs';
import path from 'path';

// Sensitive patterns that must NEVER appear in public assets
const LEAK_PATTERNS = [
  /https?:\/\/drive\.google\.com\/[^\s"')]+/i,
  /https?:\/\/[a-z0-9.-]+\.googleusercontent\.com\/[^\s"')]+/i,
  /drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+/i,
  /-----BEGIN (RSA |EC )?PRIVATE KEY-----/,
  /"type":\s*"service_account"/,
  /"private_key":\s*"-----BEGIN/,
  /GOOGLE_APPLICATION_CREDENTIALS/,
  /RESOURCE_MAP_ENCRYPTION_KEY/
];

export function auditDirectory(dirPath: string): number {
  let violations = 0;
  if (!fs.existsSync(dirPath)) return 0;

  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      violations += auditDirectory(fullPath);
    } else {
      // Skip binary media or map files if excluded
      if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.ico')) continue;

      const content = fs.readFileSync(fullPath, 'utf-8');

      for (const pattern of LEAK_PATTERNS) {
        if (pattern.test(content)) {
          console.error(`🚨 FATAL SECURITY AUDIT FAILURE: File '${fullPath}' matched forbidden pattern: ${pattern.toString()}`);
          violations++;
        }
      }
    }
  }

  return violations;
}

export function runAudit() {
  console.log('🛡️ Running comprehensive public leak audit (Part 42 / 43 / 58)...');

  // Check public directory, src/data, and dist if built
  const targetDirs = [
    path.resolve('src/data'),
    path.resolve('public'),
    path.resolve('dist')
  ].filter(d => fs.existsSync(d));

  let totalViolations = 0;
  for (const dir of targetDirs) {
    console.log(`Scanning ${dir}...`);
    totalViolations += auditDirectory(dir);
  }

  if (totalViolations > 0) {
    console.error(`❌ Security audit failed: ${totalViolations} forbidden patterns discovered in public assets!`);
    process.exit(1);
  }

  console.log('✅ Public security audit passed! Zero Drive links, zero service account keys, zero raw credentials found.');
}

if (process.argv[1] && process.argv[1].endsWith('audit-public.ts')) {
  runAudit();
}
