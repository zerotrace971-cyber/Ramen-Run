#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import process from 'node:process';

const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';

const steps = [
  { name: 'Install frontend dependencies', command: npmCommand, args: ['ci'] },
  { name: 'Lint frontend', command: npmCommand, args: ['run', 'lint'] },
  { name: 'Test frontend', command: npmCommand, args: ['run', 'test'] },
  { name: 'Build frontend', command: npmCommand, args: ['run', 'build'] },
  { name: 'Test contracts', command: 'cargo', args: ['test', '--workspace'] },
  { name: 'Build contract wasm', command: 'cargo', args: ['build', '--release', '--target', 'wasm32v1-none'] },
];

for (const step of steps) {
  console.log(`\n==> ${step.name}`);
  const result = spawnSync(step.command, step.args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log('\nLocal CI checks completed successfully.');
