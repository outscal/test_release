#!/usr/bin/env python3
import subprocess
import sys

# ========= CONFIG =========
REPO_B_URL = "https://github.com/outscal/test_release.git"  # HTTPS URL
SOURCE_BRANCH = "production"
TARGET_BRANCH = "main"

EXCLUDE_PATHS = [
]
# ==========================


def run(cmd):
    print(f"+ {' '.join(cmd)}")
    subprocess.run(cmd, check=True)


def run_allow_fail(cmd):
    print(f"+ {' '.join(cmd)}")
    return subprocess.run(cmd).returncode


def main():
    # Ensure we're inside a git repo
    run(["git", "rev-parse", "--is-inside-work-tree"])

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
    run_allow_fail(["git", "merge", "--squash", f"origin/{SOURCE_BRANCH}"])

    # Restore excluded paths from repoB
    for path in EXCLUDE_PATHS:
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

    # Commit if needed
    status = subprocess.check_output(["git", "status", "--porcelain"]).decode()
    if status.strip():
        run([
            "git", "commit",
            "-m", f"Sync {SOURCE_BRANCH} → {TARGET_BRANCH} (excluded paths preserved)"
        ])
    else:
        print("ℹ Nothing to commit")

    # Push back to repoB
    run(["git", "push", "repoB", f"sync-branch:{TARGET_BRANCH}"])

    print("✅ Sync completed successfully")


if __name__ == "__main__":
    main()
