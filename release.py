#!/usr/bin/env python3
import subprocess
import sys
import glob
import os
import io

# Set UTF-8 encoding for stdout to handle Unicode characters
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# ========= CONFIG =========
REPO_B_URL = "https://github.com/outscal/test_release.git"  # HTTPS URL
SOURCE_BRANCH = "production"
TARGET_BRANCH = "main"

EXCLUDE_PATHS = [
    ".git/",
    ".claude/skills/log-analyzer/",
    "visualise_video/",
    "log_excluded_files.py",
    "visualise_video/",
    "release.py",
    "logs/",
    ".env",
    ".temp/",
    "venv/Lib/*",
    "venv/lib/",
    "venv/Scripts/",
    "venv/bin/",
    "venv/Include/",
    "venv/include/",
    "venv/share/",
    "venv/lib64",
    "*/__pycache__/",
    "*.pyc",
    "cache_metadata.json",
    "*.lock",
    "course_manifest.json.lock",
    "*.log",
    "node_modules/",
    "dist/",
    "dist-ssr/",
    "*.local",
    ".npm-cache/",
    "TsxBuildEnv/",
    ".vscode/*",
    ".idea/",
    ".DS_Store",
    "*.suo",
    "*.ntvs*",
    "*.njsproj",
    "*.sln",
    "*.sw?",
    "venv/pyvenv.cfg",
    "run.bat",
    "run.sh",
    "setup.bat",
    "setup.sh",
    "venv/etc/jupyter/nbconfig/notebook.d/pydeck.json",
    ".claude/settings.local.json",
    ".gemini/",
    "gha-creds-*.json",
    "video-component-*.tsx",
    "debug-hybrid-tools-*.txt",
    "input-prompt-*.txt",
    "backup/",
    "recordings/",
    "Outputs/",
]
# ==========================


def run(cmd):
    print(f"+ {' '.join(cmd)}")
    subprocess.run(cmd, check=True)


def run_allow_fail(cmd):
    print(f"+ {' '.join(cmd)}")
    return subprocess.run(cmd).returncode


def expand_exclude_paths(patterns):
      """Expand glob patterns and return all matching paths."""
      expanded = set()
      for pattern in patterns:
          # Use glob to expand patterns (handles *, ?, etc.)
          matches = glob.glob(pattern, recursive=True)
          if matches:
              expanded.update(matches)

          # If pattern is a directory (ends with /), get all files inside it
          if pattern.endswith('/'):
              # Get all files recursively within the directory
              dir_contents = glob.glob(f"{pattern}**", recursive=True)
              expanded.update(dir_contents)

          # Also try with **/ prefix for recursive matching
          if not pattern.startswith("**/"):
              recursive_matches = glob.glob(f"**/{pattern}", recursive=True)
              expanded.update(recursive_matches)
              # If it's a directory pattern, also get contents of recursively found dirs
              if pattern.endswith('/'):
                  for match in recursive_matches:
                      if os.path.isdir(match):
                          nested_contents = glob.glob(f"{match}/**", recursive=True)
                          expanded.update(nested_contents)

          # Add the literal pattern too (for exact paths)
          expanded.add(pattern)
      return expanded

def main():
    # Ask for release commit message
    release_commit_message = input("Enter release commit message: ").strip()
    if not release_commit_message:
        print("❌ Commit message cannot be empty")
        sys.exit(1)

    # Ensure we're inside a git repo
    run(["git", "rev-parse", "--is-inside-work-tree"])

    # Save current branch/commit to restore later
    original_ref = subprocess.check_output(
        ["git", "rev-parse", "--abbrev-ref", "HEAD"]
    ).decode().strip()
    if original_ref == "HEAD":
        # Detached HEAD state, save commit hash
        original_ref = subprocess.check_output(
            ["git", "rev-parse", "HEAD"]
        ).decode().strip()

    # Set identity (only affects this repo)
    run(["git", "config", "user.name", "Local Sync Script"])
    run(["git", "config", "user.email", "sync@local"])

    # Add repoB remote if missing
    remotes = subprocess.check_output(["git", "remote"]).decode()
    if "repoB" not in remotes:
        run(["git", "remote", "add", "repoB", REPO_B_URL])

    # Fetch branches
    run(["git", "fetch", "origin", SOURCE_BRANCH])
    run(["git", "fetch", "repoB", TARGET_BRANCH])

    # Start from repoB target branch
    run(["git", "checkout", "-B", "sync-branch", f"repoB/{TARGET_BRANCH}"])

    # Merge repoA source branch (squash to avoid history merge)
    run_allow_fail(["git", "merge", "--squash", "--allow-unrelated-histories", f"origin/{SOURCE_BRANCH}"])

    # Expand glob patterns to get all matching paths
    expanded_paths = expand_exclude_paths(EXCLUDE_PATHS)
    print(f"ℹ Excluding {len(expanded_paths)} paths from sync")

    # Restore excluded paths from repoB (keeps repoB's version)
    for path in expanded_paths:
        subprocess.run(
            ["git", "checkout", f"repoB/{TARGET_BRANCH}", "--", path],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

    run(["git", "add", "-A"])

    # Check for unresolved conflicts
    conflicts = subprocess.check_output(
        ["git", "diff", "--name-only", "--diff-filter=U"]
    ).decode().strip()

    if conflicts:
        print("❌ Unresolved merge conflicts remain:")
        print(conflicts)
        sys.exit(1)

    # Check current branch
    current_branch = subprocess.check_output(
        ["git", "rev-parse", "--abbrev-ref", "HEAD"]
    ).decode().strip()

    # Check if there are any changes
    status = subprocess.check_output(["git", "status", "--porcelain"]).decode()

    if status.strip():
        if current_branch == "sync-branch":
            # Discard changes if on sync-branch
            print("ℹ Discarding changes on sync-branch")
            run(["git", "reset", "--hard", "HEAD"])
            print("ℹ No changes to push")
        else:
            # Commit changes if on other branches
            run([
                "git", "commit",
                "-m", f"{release_commit_message}"
            ])
    else:
        print("ℹ Nothing to commit")

    # Push back to repoB
    run(["git", "push", "repoB", f"sync-branch:{TARGET_BRANCH}"])

    # Restore workspace to original state
    run(["git", "checkout", original_ref])
    run(["git", "branch", "-D", "sync-branch"])
    run(["git", "remote", "remove", "repoB"])

    print("✅ Sync completed successfully")


if __name__ == "__main__":
    main()
