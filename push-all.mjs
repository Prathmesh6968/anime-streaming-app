import { Octokit } from '@octokit/rest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function pushToGithub() {
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
    if (!token) throw new Error('No GitHub token');

    const octokit = new Octokit({ auth: token });
    console.log('✓ Connected to GitHub');

    // Files to push
    const filesToPush = [
      'src/pages/Login.tsx',
      'vite.config.ts',
      'vercel.json'
    ];

    for (const file of filesToPush) {
      const filePath = path.join(__dirname, file);
      if (!fs.existsSync(filePath)) continue;

      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Try to get current file to get SHA
        let sha;
        try {
          const { data: existingFile } = await octokit.rest.repos.getContent({
            owner: 'Prathmesh6968',
            repo: 'anime-streaming-app',
            path: file,
            branch: 'main'
          });
          sha = existingFile.sha;
        } catch (e) {
          // File doesn't exist yet
        }

        await octokit.rest.repos.createOrUpdateFileContents({
          owner: 'Prathmesh6968',
          repo: 'anime-streaming-app',
          path: file,
          message: `Update ${file}`,
          content: Buffer.from(content).toString('base64'),
          branch: 'main',
          ...(sha && { sha })
        });
        
        console.log(`✓ Pushed ${file}`);
      } catch (e) {
        console.log(`⚠ Skipped ${file}: ${e.message}`);
      }
    }

    console.log('\n✓ All files pushed to GitHub!');
    console.log('Repository: https://github.com/Prathmesh6968/anime-streaming-app');
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

pushToGithub();
