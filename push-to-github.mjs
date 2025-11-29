import { execSync } from 'child_process';
import https from 'https';

async function getToken() {
  return new Promise((resolve, reject) => {
    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
    const xReplitToken = process.env.REPL_IDENTITY 
      ? 'repl ' + process.env.REPL_IDENTITY 
      : process.env.WEB_REPL_RENEWAL 
      ? 'depl ' + process.env.WEB_REPL_RENEWAL 
      : null;

    if (!xReplitToken) {
      reject(new Error('No Replit token'));
      return;
    }

    const options = {
      hostname: hostname,
      path: '/api/v2/connection?include_secrets=true&connector_names=github',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    };

    https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const token = json.items?.[0]?.settings?.access_token || json.items?.[0]?.settings?.oauth?.credentials?.access_token;
          resolve(token);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject).end();
  });
}

async function push() {
  try {
    const token = await getToken();
    if (!token) throw new Error('No GitHub token');

    process.chdir('/home/runner/workspace/app-7uoulm93wsn5');
    
    const url = `https://x-access-token:${token}@github.com/Prathmesh6968/anime-streaming-app.git`;
    
    execSync('git config user.email "bot@replit.com"');
    execSync('git config user.name "Replit Bot"');
    execSync(`git push ${url} main:main --force`, { stdio: 'inherit' });
    
    console.log('\n✓ Code pushed to GitHub successfully!');
    console.log('Repository: https://github.com/Prathmesh6968/anime-streaming-app');
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

push();
