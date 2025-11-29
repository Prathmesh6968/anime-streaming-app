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
    
    const content = fs.readFileSync('/home/runner/workspace/app-7uoulm93wsn5/vercel.json', 'utf8');
    
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: 'Prathmesh6968',
      repo: 'anime-streaming-app',
      path: 'vercel.json',
      message: 'Add Vercel configuration for React Router',
      content: Buffer.from(content).toString('base64'),
      branch: 'main'
    });

    console.log('✓ vercel.json uploaded to GitHub');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

updateGithub();
