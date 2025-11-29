import { Octokit } from '@octokit/rest';
import fs from 'fs';

async function updateGithub() {
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
    
    const content = fs.readFileSync('/home/runner/workspace/app-7uoulm93wsn5/src/pages/Login.tsx', 'utf8');
    
    // Get SHA for existing file
    let sha;
    try {
      const { data: existingFile } = await octokit.rest.repos.getContent({
        owner: 'Prathmesh6968',
        repo: 'anime-streaming-app',
        path: 'src/pages/Login.tsx',
        branch: 'main'
      });
      sha = existingFile.sha;
    } catch (e) {
      // File doesn't exist
    }

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: 'Prathmesh6968',
      repo: 'anime-streaming-app',
      path: 'src/pages/Login.tsx',
      message: 'Replace old Google SSO with new Google OAuth',
      content: Buffer.from(content).toString('base64'),
      branch: 'main',
      ...(sha && { sha })
    });

    console.log('✓ Updated Google OAuth on GitHub');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

updateGithub();
