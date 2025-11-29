import { Octokit } from '@octokit/rest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function uploadToGithub() {
  try {
    // Get access token
    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
    const xReplitToken = process.env.REPL_IDENTITY 
      ? 'repl ' + process.env.REPL_IDENTITY 
      : process.env.WEB_REPL_RENEWAL 
      ? 'depl ' + process.env.WEB_REPL_RENEWAL 
      : null;

    if (!xReplitToken) throw new Error('No Replit token');

    const response = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
      { headers: { 'Accept': 'application/json', 'X_REPLIT_TOKEN': xReplitToken } }
    );
    
    const data = await response.json();
    const token = data.items?.[0]?.settings?.access_token;
    if (!token) throw new Error('No GitHub token');

    const octokit = new Octokit({ auth: token });
    
    console.log('✓ Connected to GitHub');

    function getAllFiles(dir, baseDir = '') {
      let files = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (['.git', 'node_modules', '.next', 'dist', 'build', '.DS_Store'].includes(entry.name)) continue;
        
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.join(baseDir, entry.name);
        
        if (entry.isDirectory()) {
          files = files.concat(getAllFiles(fullPath, relativePath));
        } else {
          files.push({ path: relativePath, fullPath });
        }
      }
      return files;
    }

    const files = getAllFiles(__dirname);
    console.log(`✓ Found ${files.length} files to upload`);

    // Upload files
    let count = 0;
    for (const file of files) {
      try {
        const content = fs.readFileSync(file.fullPath, 'utf8');
        await octokit.rest.repos.createOrUpdateFileContents({
          owner: 'Prathmesh6968',
          repo: 'anime-streaming-app',
          path: file.path,
          message: `Add ${file.path}`,
          content: Buffer.from(content).toString('base64'),
          branch: 'main'
        });
        count++;
        if (count % 50 === 0) console.log(`✓ Uploaded ${count} files...`);
      } catch (e) {
        if (!e.message.includes('409')) throw e;
      }
    }

    console.log(`\n✓ Successfully uploaded ${count} files!`);
    console.log('✓ Repository: https://github.com/Prathmesh6968/anime-streaming-app');
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

uploadToGithub();
