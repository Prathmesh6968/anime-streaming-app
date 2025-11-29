import { Octokit } from '@octokit/rest';
import { execSync } from 'child_process';

async function uploadToGithub() {
  try {
    // Get access token from Replit connection
    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
    const xReplitToken = process.env.REPL_IDENTITY 
      ? 'repl ' + process.env.REPL_IDENTITY 
      : process.env.WEB_REPL_RENEWAL 
      ? 'depl ' + process.env.WEB_REPL_RENEWAL 
      : null;

    if (!xReplitToken) {
      throw new Error('Cannot get Replit token');
    }

    const response = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    );
    
    const data = await response.json();
    const connectionSettings = data.items?.[0];
    const accessToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;

    if (!accessToken) {
      throw new Error('No GitHub access token found');
    }

    // Create Octokit client
    const octokit = new Octokit({ auth: accessToken });

    // Get authenticated user
    const { data: user } = await octokit.rest.users.getAuthenticated();
    console.log(`✓ Authenticated as: ${user.login}`);

    // Create new repository
    const repoName = 'anime-streaming-app';
    console.log(`✓ Creating repository: ${repoName}`);
    
    const { data: repo } = await octokit.rest.repos.createForAuthenticatedUser({
      name: repoName,
      description: 'Anime streaming application built with React and Vite',
      private: false,
      auto_init: false
    });

    console.log(`✓ Repository created: ${repo.html_url}`);

    // Now push the code using git
    process.chdir('/home/runner/workspace/app-7uoulm93wsn5');

    // Configure git
    execSync('git config user.email "noreply@replit.com"');
    execSync('git config user.name "Replit"');

    // Add remote and push
    try {
      execSync('git remote remove origin', { stdio: 'pipe' });
    } catch (e) {
      // Remote might not exist
    }

    execSync(`git remote add origin ${repo.clone_url}`);
    execSync('git branch -M main');
    execSync('git push -u origin main --force');

    console.log(`\n✓ Success! Your project is uploaded to: ${repo.html_url}`);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

uploadToGithub();
