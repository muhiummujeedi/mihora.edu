# VU Mega Index — Bot Integration Specification

**File:** `VU_Mega_Index_Bot.txt` (primary for the bot) — `VU_Mega_Index_Bot.md` (human-readable mirror)
**Records:** 28,328 unique files · 411 course codes (410 courses + GENERAL)
**Design:** one record per file, six fixed key-value fields, identical order on every line.

## 1. Record Format

Every file occupies exactly one line:

```
COURSE=<code> NAME=<original file name> FORMAT=<format> TYPE=<type> TAGS=<tags> LINK=<url>
```

Example:

```
COURSE=CS101 NAME=CS 101 Midterm M.C.Q file by Amaan Khan.pdf FORMAT=PDF TYPE=MIDTERM TAGS=MCQ,OBJECTIVE,MIDTERM LINK=https://drive.google.com/file/d/1sH5s_KVf0gOa00Yql2lWiMqyG51ciIbs/view
```

## 2. Field Definitions

| Field | Value Set | Description |
|---|---|---|
| `COURSE` | `ACC301`, `CS101`, ..., `GENERAL` | The course code. Never empty. `GENERAL` = files with no course code (screenshots, tools, guidelines). |
| `NAME` | free text | The **real original file name** exactly as it appears on Google Drive, with extension. |
| `FORMAT` | `PDF` · `DOC` · `PPT` · `IMAGE` · `XLS` · `TXT` · `ARCHIVE` · `OTHER` | File format derived from the extension. |
| `TYPE` | `MIDTERM` · `FINALTERM` · `QUIZ` · `ASSIGNMENT` · `HANDOUT` · `MCQFILE` · `OTHER` | Material type, determined by the section the file sat in inside the crawled Drive folders. |
| `TAGS` | comma-separated list from the set below, or `NONE` | Content keywords extracted from the real file name. |
| `LINK` | Google Drive URL | The direct share link. The Drive file ID is inside the URL (`/file/d/ID/view`) — use it with the Drive API to download. |

## 3. TAG Values and Meaning

| Tag | Means | Example trigger in file name |
|---|---|---|
| `MCQ` | MCQ file | "MCQs", "M.C.Q" |
| `OBJECTIVE` | objective-type content | "Objective" |
| `SUBJECTIVE` | long/short questions, descriptive | "Subjective", "Short Questions", "Long Questions" |
| `SOLVED` | solved material | "Solved" |
| `PAST-PAPER` | past exam paper | "Past Papers", "Old Paper" |
| `PAPER` | question paper | "Question Paper" |
| `IMPORTANT` | important questions | "Imp", "Important" |
| `CURRENT` | current/recent session paper | "Current", "Spring 2023" patterns |
| `GUESS` | guess paper | "Guess" |
| `GRAND-QUIZ` | grand quiz | "Grand Quiz" |
| `HANDOUT` | handout content | "Handout" |
| `LECTURE` | lecture notes | "Lecture" |
| `SLIDES` | PowerPoint slides | "PPT", "Slide", "PowerPoint" |
| `ASSIGNMENT` | assignment file | "Assignment" |
| `GDB` | GDB solution | "GDB" |
| `FORMULA` | formula sheet | "Formula" |
| `MIDTERM` / `FINALTERM` | also appear in TAGS when the name itself says Mid/Final (TYPE already covers section) |

Tags are ordered by priority and deduplicated. A paper named `CS101 SOLVED SHORT AND LONG QUESTIONS` becomes `TAGS=SOLVED,SUBJECTIVE`.

## 4. Parsing Recipe (any language)

```python
import re
for line in open('VU_Mega_Index_Bot.txt'):
    line = line.strip()
    if not line.startswith('COURSE='): continue
    rec = dict(re.findall(r'(\w+)=(.*?)(?= \w+=|$)', line))
    # rec = {'COURSE':..., 'NAME':..., 'FORMAT':..., 'TYPE':..., 'TAGS':..., 'LINK':...}
```

Notes for robustness:

1. The first 7 lines of the file are a header; skip any line not starting with `COURSE=`.
2. `NAME` is always the second field — parsing left-to-right `FIELD=` stops work even if a name contained `=` (none found, but the regex above handles it).
3. Every record is unique by Drive file ID — no duplicate links.
4. Files are sorted by `COURSE`, then `TYPE`, then `NAME`.

## 5. Search Logic Suggestions for the Bot

1. **Match course code first** — search `COURSE=CS101`. Normalize input: strip spaces/dash, uppercase (`"cs 101"` → `CS101`).
2. **Narrow by TYPE** — `"midterm"` → `TYPE=MIDTERM`, `"final"` → `FINALTERM`, `"quiz"` → `QUIZ`, `"handout"` → `HANDOUT`, `"assignment"`/`"gdb"` → `ASSIGNMENT`, `"mcq"` → prefer `TAGS=MCQ` or `TYPE=MCQFILE`.
3. **Content preference** — if the student asks for MCQs, prefer `TAGS=MCQ,OBJECTIVE,SOLVED` entries; if they ask for theory, prefer `TAGS=SUBJECTIVE,SOLVED,PAST-PAPER`.
4. **Prefer SOLVED + CURRENT** — rank results with `SOLVED` and `CURRENT` tags higher.
5. **Send 1-3 best files at a time**, then offer "more?" to avoid WhatsApp limits.
6. **File ID extraction** for download: `re.search(r'/file/d/([A-Za-z0-9_-]+)', link)`.

## 6. Coverage Numbers (for sanity checks)

| TYPE | Count |
|---|---|
| FINALTERM | 7,361 |
| QUIZ | 5,733 |
| OTHER | 5,057 |
| MIDTERM | 3,877 |
| MCQFILE | 3,256 |
| HANDOUT | 2,625 |
| ASSIGNMENT | 419 |

| Top TAG | Count |
|---|---|
| SOLVED | 4,648 |
| MCQ | 2,366 |
| SUBJECTIVE | 1,042 |
| SLIDES | 934 |
| GRAND-QUIZ | 805 |
| PAST-PAPER | 684 |

These counts sum across files; a single file can carry multiple tags.
