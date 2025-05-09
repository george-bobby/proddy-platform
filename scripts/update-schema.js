// This script is used to update the Convex schema
// Run with: node scripts/update-schema.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Updating Convex schema...');

try {
  // Run npx convex dev to update the schema
  execSync('npx convex dev', { stdio: 'inherit' });
  
  console.log('Schema updated successfully!');
} catch (error) {
  console.error('Error updating schema:', error);
  process.exit(1);
}
