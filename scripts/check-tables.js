import * as https from 'https';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL! + '/rest/v1/?apikey=' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed.definitions.citizen_profiles, null, 2));
    } catch (e) {
      console.error('Parse error', e.message);
    }
  });
}).on('error', err => console.error('Fetch error:', err.message));
