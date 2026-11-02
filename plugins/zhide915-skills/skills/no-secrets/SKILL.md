---
name: no-secrets
description: Scan staged changes or a range of commits for secrets before they reach history or a remote. Use when the user asks to check for secrets, or before a commit or a push.
argument-hint: "[revision range]"
---

This skill scans changes for secrets before they reach history or a remote. A **hit** is an added line that looks like a secret, or an added file with a credential name, such as `id_rsa`. Each hit stops the work until the user judges it. The skill only reads.

## Steps

1. **Scan**: In the repository of the changes, run the script on the staged changes or on a range of commits:
   - `node <skill folder>/scripts/scan-secrets.mjs --staged`
   - `node <skill folder>/scripts/scan-secrets.mjs --range origin/main..HEAD`

   The script prints each hit with its fingerprint, and each added binary.
   - If it exits with 2: the scan could not run. Stop, and quote its message.

   Done when you have each hit and each binary.
2. **Judge**: Read the line of each hit. Open each binary that can hold a secret, such as a database dump. A secret in a binary is a hit. Tell the user each hit, with the action that fits it:
   - A test fixture: add its fingerprint to `.gitleaksignore`, after the user agrees.
   - Only staged: unstage it, or ignore the file.
   - Only in local commits: rewrite those commits, after the user agrees. History keeps the secret after a later removal.
   - On a remote branch, as `git branch -r --contains <commit>` shows: the secret is exposed, and the user must rotate it.

   Done when each hit and each binary has an action.
