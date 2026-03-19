import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { REPO_ROOT, SOLUTION_REPO_ROOT } from './solution-diff-surface.mjs';

const KNIP_ARGS = [
  'knip',
  '--reporter',
  'json',
  '--no-config-hints',
  '--include',
  'files,exports,types',
];

function runKnip(cwd, label) {
  const result = spawnSync('bunx', KNIP_ARGS, {
    cwd,
    encoding: 'utf8',
  });

  if (result.error) {
    throw new Error(`${label} knip failed to start: ${result.error.message}`);
  }

  const stdout = result.stdout?.trim();
  const stderr = result.stderr?.trim();

  if (stderr) {
    console.error(stderr);
  }

  if (!stdout) {
    return { files: [], issues: [] };
  }

  try {
    return JSON.parse(stdout);
  } catch {
    const combinedOutput = [stdout, stderr].filter(Boolean).join('\n');
    throw new Error(`${label} knip output was not valid JSON.\n${combinedOutput}`);
  }
}

const sameFileCache = new Map();

function isSameAsSolution(relativeFilePath) {
  if (sameFileCache.has(relativeFilePath)) {
    return sameFileCache.get(relativeFilePath);
  }

  const currentFilePath = path.join(REPO_ROOT, relativeFilePath);
  const solutionFilePath = path.join(SOLUTION_REPO_ROOT, relativeFilePath);

  if (!fs.existsSync(currentFilePath) || !fs.existsSync(solutionFilePath)) {
    sameFileCache.set(relativeFilePath, false);
    return false;
  }

  const sameContent =
    fs.readFileSync(currentFilePath, 'utf8') === fs.readFileSync(solutionFilePath, 'utf8');
  sameFileCache.set(relativeFilePath, sameContent);
  return sameContent;
}

function filterReport(report) {
  const filteredFiles = (report.files ?? []).filter((file) => !isSameAsSolution(file));
  const filteredIssues = [];
  let skippedIssueCount = 0;

  for (const issue of report.issues ?? []) {
    if (isSameAsSolution(issue.file)) {
      skippedIssueCount +=
        (issue.exports?.length ?? 0) + (issue.types?.length ?? 0);
      continue;
    }

    filteredIssues.push(issue);
  }

  return {
    files: filteredFiles,
    issues: filteredIssues,
    skippedIssueCount,
  };
}

function formatReport(report) {
  const output = [];

  for (const file of [...(report.files ?? [])].sort()) {
    output.push(`${file} - unused file`);
  }

  const sortedIssues = [...(report.issues ?? [])].sort((left, right) =>
    left.file.localeCompare(right.file)
  );

  for (const issue of sortedIssues) {
    for (const entry of [...(issue.exports ?? [])].sort((left, right) =>
      left.name.localeCompare(right.name)
    )) {
      output.push(`${issue.file}:${entry.line}:${entry.col} - unused export ${entry.name}`);
    }

    for (const entry of [...(issue.types ?? [])].sort((left, right) =>
      left.name.localeCompare(right.name)
    )) {
      output.push(`${issue.file}:${entry.line}:${entry.col} - unused type ${entry.name}`);
    }
  }

  return output;
}

try {
  const currentReport = runKnip(REPO_ROOT, 'Current repo');
  const filteredReport = filterReport(currentReport);
  const outputLines = formatReport(filteredReport);

  if (outputLines.length > 0) {
    console.log(outputLines.join('\n'));
    if (filteredReport.skippedIssueCount > 0) {
      console.log(
        `Skipped ${filteredReport.skippedIssueCount} knip issue(s) that already exist in the solution repo.`
      );
    }
    process.exit(1);
  }

  if (filteredReport.skippedIssueCount > 0) {
    console.log(
      `Knip completed with no non-candidate issues. Skipped ${filteredReport.skippedIssueCount} baseline issue(s) from the solution repo.`
    );
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
}
