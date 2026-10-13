---
name: sweep-secrets
description: Sweep staged changes or a range of commits for secrets before they reach history or a remote. Use when the user asks to check for secrets, or when another skill sweeps its changes.
argument-hint: "[revision range]"
---

This skill sweeps changes for secrets before they reach history or a remote. A **hit** is an added line that looks like a secret, or an added file with a credential name, such as `id_rsa`. Each hit stops the work until the user judges it. The skill keeps files and commits as they are.

## Steps

Load `zhide915-skills:report` first.

1. **Sweep**: From the folder of the changes, run the script on the staged changes or on a range of commits:
   - `node <skill folder>/scripts/sweep-secrets.mjs --staged`
   - `node <skill folder>/scripts/sweep-secrets.mjs --range origin/main..HEAD`

   The script prints each hit with its fingerprint, and each added binary.
   - If it exits with 2: stop, and quote its message.

   Done when you have each hit and each binary.
2. **Judge**: Read the line of each hit. Open each binary that can hold a secret, such as a database dump. A secret in a binary is a hit. Give each hit one action:
   - If it is a test fixture: give a Your call to add its fingerprint to `.gitleaksignore`.
   - If it is only staged: give a Your task to remove it, or to ignore the file.
   - If only local commits hold it: give a Your call to rewrite those commits. History keeps the secret after a later removal.
   - If `git branch -r --contains <commit>` lists a branch: give a Your task to rotate the secret. The secret is exposed.

   Done when each hit and each binary has an action.

## Report

```markdown
Swept `origin/main..HEAD`: 1 hit, 0 binaries. 1 task needs you.

## Your task
1. **Rotate the Stripe key.** Commit `abc1234` is on `origin/feature`, so the key is exposed.

## Hits
- `abc1234` `src/pay.ts:12`, stripe-access-token, fingerprint `src/pay.ts:stripe-access-token:12`: a real key, pushed.
```
