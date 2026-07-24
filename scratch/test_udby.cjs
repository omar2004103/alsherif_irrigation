const { PrismaClient } = require('@prisma/client');
const p1 = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.udbyruwuffeecunmtcwm:2004103OmarAdel%40@aws-0-eu-central-1.pooler.supabase.com:5432/postgres',
    },
  },
});

async function testConn() {
  try {
    const res = await p1.$queryRawUnsafe('SELECT 1 as test');
    console.log('✅ Connected to udbyruwuffeecunmtcwm database!', res);
  } catch (e) {
    console.error('❌ Failed udbyruwuffeecunmtcwm:', e.message);
  }
  await p1.$disconnect();
}
testConn();
