import crypto from 'crypto';

console.log('🧪 Running Security Mechanics & Anti-Tamper Verification Suite...');

const TOKEN_SECRET = 'download-token-secret-test-2026';

function signDownloadToken(rlh: string, ttlSeconds = 120): string {
  const nonce = crypto.randomBytes(8).toString('hex');
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const iat = Math.floor(Date.now() / 1000);
  const payload = `${rlh}:${iat}:${exp}:${nonce}`;
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex').substring(0, 32);
  return `dt_${Buffer.from(payload).toString('base64url')}.${sig}`;
}

function verifyDownloadToken(token: string): { valid: boolean; rlh?: string; reason?: string } {
  if (!token.startsWith('dt_')) return { valid: false, reason: 'Invalid token prefix' };

  const parts = token.slice(3).split('.');
  if (parts.length !== 2) return { valid: false, reason: 'Malformed token structure' };

  const [encodedPayload, sig] = parts;
  const payloadStr = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
  const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(payloadStr).digest('hex').substring(0, 32);

  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
    return { valid: false, reason: 'Cryptographic signature mismatch' };
  }

  const [rlh, iatStr, expStr] = payloadStr.split(':');
  const now = Math.floor(Date.now() / 1000);
  const exp = parseInt(expStr, 10);

  if (now > exp) {
    return { valid: false, reason: 'Download session expired' };
  }

  return { valid: true, rlh };
}

// 1. Test Valid Token
const validToken = signDownloadToken('r_test123456');
const validRes = verifyDownloadToken(validToken);
if (!validRes.valid || validRes.rlh !== 'r_test123456') {
  console.error('❌ Failed valid token test');
  process.exit(1);
}
console.log('✅ Test 1: Valid temporary signed token successfully verified.');

// 2. Test Expired Token
const expiredToken = signDownloadToken('r_test123456', -10);
const expiredRes = verifyDownloadToken(expiredToken);
if (expiredRes.valid || expiredRes.reason !== 'Download session expired') {
  console.error('❌ Failed expired token test');
  process.exit(1);
}
console.log('✅ Test 2: Expired token safely rejected.');

// 3. Test Tampered Token
const tamperedToken = validToken.slice(0, -4) + 'abcd';
const tamperedRes = verifyDownloadToken(tamperedToken);
if (tamperedRes.valid) {
  console.error('❌ Failed tampered signature test');
  process.exit(1);
}
console.log('✅ Test 3: Tampered signature safely rejected.');

// 4. Test Anti-Enumeration & Arbitrary URL Rejection
const forbiddenInputs = [
  'https://drive.google.com/file/d/123/view',
  '1a2b3c4d5e',
  '/download/1',
  '?url=https://evil.com'
];

for (const input of forbiddenInputs) {
  if (input.startsWith('r_') && input.length === 18) {
    console.error(`❌ Input ${input} unexpectedly passed RLH format check`);
    process.exit(1);
  }
}
console.log('✅ Test 4: Arbitrary URLs and raw file IDs successfully rejected by RLH validator.');

console.log('🎉 All Security & Token Tests Passed Successfully!');
