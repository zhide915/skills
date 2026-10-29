---
name: no-needless-words
description: Cut the words a reader does not need from text that is not code. Use when the user asks to tighten text.
argument-hint: "[text or path]"
---

This skill cuts each word that the reader does not need, and keeps each fact. **Writing** is all text that is not code: documents, comments, docstrings, messages, commit messages, and pull request text. Writing is tight when each word carries a fact.

## Steps

Load `zhide915-skills:report-style` first.

1. **Bound**: Use the text that the caller names. Else, use the lines of writing that the branch adds or changes. Skip generated and vendored files. Keep each uncommitted file that the caller did not name as it is.
   - If the text is not in a file: the report is the tight text alone.
   - If the text is already published, such as a commit in history: give the new text in a Your call.
   - If the scope holds no writing: report `Nothing to tighten.`

   Done when you can name each file and each line range.
2. **Cut**: Cut each sentence that the reader does not need. Then cut each word that the reader does not need. Follow the style guide of the repository, or else ASD-STE100. Keep code and code samples as they are. A comment keeps only what the code cannot say: a limit, a trap, or a reason. A message says what occurred and what to do.
   - If a test, a selector, or another program matches a heading or a string: keep it. Give the new text in a Your call.

   Done when each sentence is kept or cut.
3. **Verify**: Give `git diff -- <files>` to a fresh agent. Ask it to list each lost fact, negation, number, qualifier, and condition. Put each one back. Then run the checks of the repository on the files.

   Done when the fresh agent lists nothing, and each check passes.

## Report

```markdown
Cut 14 lines in 3 files. 1 call needs you.

## Your call
1. **Can I shorten the heading "Getting started with the CLI"?** Two documents link to its anchor.
   - **a. (recommended) Keep it.** The links stay valid.
   - **b. Shorten it to "Start".** I update both links.

Reply with one letter for each call, like `1a`.

## Run
- Files: `README.md`, `docs/cli.md`, `src/cli.ts`. Fact check: a fresh agent found no lost fact.
```
