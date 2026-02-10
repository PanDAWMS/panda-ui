const { execSync } = require('child_process');
const { writeFileSync } = require('fs');
const path = require('path');

// On your local machine, this will be relative to where you run the command
const outputPath = path.join(__dirname, '../assets/version.json');

try {
  // No need for 'cwd' if you run this from the project root locally
  const hash = execSync('git rev-parse --short HEAD').toString().trim();
  const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

  const versionData = JSON.stringify(
    {
      version: `${branch}@${hash}`,
    },
    null,
    2,
  );

  writeFileSync(outputPath, versionData);
  console.log('Local version.json updated for sync');
} catch (e) {
  console.error('Local Git error:', e.message);
}
