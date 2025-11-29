import { Octokit } from '@octokit/rest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function pushAllToGithub() {
  try {
    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
    const xReplitToken = process.env.REPL_IDENTITY 
      ? 'repl ' + process.env.REPL_IDENTITY 
      : process.env.WEB_REPL_RENEWAL 
      ? 'depl ' + process.env.WEB_REPL_RENEWAL 
      : null;

    const response = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
      { headers: { 'Accept': 'application/json', 'X_REPLIT_TOKEN': xReplitToken } }
    );
    
    const data = await response.json();
    const token = data.items?.[0]?.settings?.access_token;
    if (!token) throw new Error('No token');

    const octokit = new Octokit({ auth: token });
    console.log('✓ Connected to GitHub');

    function getAllFiles(dir, baseDir = '') {
      let files = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (['.git', 'node_modules', '.next', 'dist', 'build', '.DS_Store', '.mjs'].includes(entry.name)) continue;
        
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
    console.log(`✓ Found ${files.length} files to sync`);

    let count = 0;
    for (const file of files) {
      try {
        const content = fs.readFileSync(file.fullPath, 'utf8');
        
        let sha;
        try {
          const { data: existingFile } = await octokit.rest.repos.getContent({
            owner: 'Prathmesh6968',
            repo: 'anime-streaming-app',
            path: file.path,
            branch: 'main'
          });
          sha = existingFile.sha;
        } catch (e) {}

        await octokit.rest.repos.createOrUpdateFileContents({
          owner: 'Prathmesh6968',
          repo: 'anime-streaming-app',
          path: file.path,
          message: `Sync all files`,
          content: Buffer.from(content).toString('base64'),
          branch: 'main',
          ...(sha && { sha })
        });
        count++;
        if (count % 50 === 0) console.log(`✓ Synced ${count} files...`);
      } catch (e) {
        if (!e.message.includes('409')) throw e;
      }
    }

    console.log(`\n✅ Successfully synced ${count} files to GitHub!`);
    console.log('📍 Repository: https://github.com/Prathmesh6968/anime-streaming-app');
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

pushAllToGithub();
