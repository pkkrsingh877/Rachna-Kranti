# Literary Platform Architecture v2

## Vision

The platform should not treat every piece of writing as generic "Content".

Poems, Stories, Books, Novels, and Dramas are fundamentally different writing formats with different creation workflows, editing experiences, reading experiences, publishing requirements, and export needs.

The system should therefore evolve from:

```txt
Content
 ├─ Poem
 ├─ Story
 ├─ Prose
 └─ Drama
```

into:

```txt
Poetry Module
Story Module
Book Module
Drama Module
```

while still sharing common infrastructure where appropriate.

---

# Core Principle

Share infrastructure.

Do not share workflows.

Examples:

Shared:

* Authentication
* Permissions
* Publishing engine
* Tags
* Cover image upload
* Search
* Comments
* Likes
* Notifications
* Rich text editor
* Export engine

Not Shared:

* Book editor
* Drama editor
* Poem editor
* Story editor

Each writing type should have its own UX.

---

# Content Categories

## Poetry

Structure:

```txt
Poem
```

Editor:

```txt
Title
Description

Editor

Publish
```

Simple.

---

## Story / Prose

Structure:

```txt
Story
```

Editor:

```txt
Title
Description

Editor

Publish
```

Simple.

---

## Books

Books and novels should use the same system.

A novel is simply a type of book.

Example:

```ts
type BookType =
  | "Novel"
  | "Novella"
  | "Anthology"
  | "Book";
```

---

## Dramas

Separate module entirely.

Structure:

```txt
Drama
 ├─ Act
 │   ├─ Scene
 │   ├─ Scene
 │   └─ Scene
 └─ Act
```

---

# Database Architecture

## Existing Content Collection

Keep for:

* Poems
* Stories
* Prose

---

# Book System

## Book

```ts
Book {
  id
  title
  slug

  authorId

  type

  description
  coverImage

  tags

  status

  chapterCount

  createdAt
  updatedAt
}
```

---

## Chapter

```ts
Chapter {
  id

  bookId

  title

  order

  content

  wordCount

  status

  createdAt
  updatedAt
}
```

Relationship:

```txt
Book
 ├─ Chapter 1
 ├─ Chapter 2
 ├─ Chapter 3
 └─ Chapter 4
```

---

# Drama System

## Drama

```ts
Drama {
  id

  title
  slug

  authorId

  description
  coverImage

  status

  actsCount
  scenesCount

  createdAt
  updatedAt
}
```

---

## Act

```ts
Act {
  id

  dramaId

  title

  order
}
```

---

## Scene

```ts
Scene {
  id

  dramaId

  actId

  title

  order

  content

  wordCount
}
```

Relationship:

```txt
Drama
 ├─ Act I
 │   ├─ Scene 1
 │   ├─ Scene 2
 │   └─ Scene 3
 │
 └─ Act II
     ├─ Scene 1
     └─ Scene 2
```

---

# Editor Architecture

## Shared Components

Reusable:

```txt
EditorToolbar
TiptapEditor
ImageUploader
TagSelector
StatusSelector
PublishModal
SaveDraftButton
CoverUploader
```

These components should be reused everywhere.

---

# Book Editor

Route:

```txt
/books/create
/books/[id]/edit
```

Layout:

```txt
------------------------------------------------
Book Metadata
------------------------------------------------

Title
Description
Cover

------------------------------------------------
Chapters
------------------------------------------------

1. Prologue
2. Chapter One
3. Chapter Two

[ + Chapter ]

------------------------------------------------
Editor
------------------------------------------------

Tiptap
```

Behavior:

* Create chapter
* Delete chapter
* Duplicate chapter
* Reorder chapters
* Draft chapters
* Publish chapters

Only one chapter loaded at a time.

Never load the entire book into the editor.

---

# Drama Editor

Route:

```txt
/dramas/create
/dramas/[id]/edit
```

Layout:

```txt
------------------------------------------------
Drama Metadata
------------------------------------------------

Title
Description
Cover

------------------------------------------------
Acts / Scenes
------------------------------------------------

ACT I
  Scene 1
  Scene 2

ACT II
  Scene 1

[ + Act ]
[ + Scene ]

------------------------------------------------
Editor
------------------------------------------------

Tiptap
```

Behavior:

* Create acts
* Create scenes
* Move scenes
* Move acts
* Duplicate scenes

Only one scene loaded at a time.

---

# Reader Experience

Reader experience should be different per content type.

---

## Book Reading

Route:

```txt
/books/[slug]
```

Layout:

```txt
Cover

Title

Author

Description

Table of Contents

Chapter List
```

When a chapter opens:

```txt
Previous Chapter

Chapter Title

Reading Area

Next Chapter
```

Features:

* Reading progress
* Bookmarks
* Reading time
* Continue reading
* Dark mode
* Adjustable font size

---

## Drama Reading

Route:

```txt
/dramas/[slug]
```

Layout:

```txt
Title

Author

Acts

Scenes
```

Navigation:

```txt
Act I
 ├─ Scene 1
 ├─ Scene 2

Act II
 ├─ Scene 1
 └─ Scene 2
```

Reader can jump directly to scenes.

---

# Publishing System

All modules should use a shared publishing engine.

Statuses:

```txt
Draft
Review
Scheduled
Published
Archived
```

---

## Book Publishing

A book becomes publishable when:

```txt
Has title
Has description
Has cover
Has at least one chapter
```

Publishing locks metadata version.

---

## Drama Publishing

A drama becomes publishable when:

```txt
Has title
Has description
Has at least one act
Has at least one scene
```

---

# Draft System

Auto-save every 30 seconds.

Track:

```txt
Last Edited
Draft Version
Published Version
```

Future:

```txt
Version History
```

similar to Google Docs.

---

# Export System

One of the most valuable features.

---

## PDF Export

Users should be able to export:

```txt
Book
Drama
Poem
Story
```

to PDF.

Use:

```txt
Export PDF
```

button.

Generated PDF should include:

* Cover
* Title page
* Author page
* Table of contents
* Chapters
* Page numbers

---

## Print Ready PDF

A second export mode:

```txt
Print Ready PDF
```

for physical publishing.

Includes:

```txt
Trim size
Margins
Headers
Footers
Page numbers
Front matter
```

Useful for:

Amazon KDP
IngramSpark
Local printing presses
Self publishing

---

## EPUB Export

Future feature.

Generate:

```txt
.epub
```

for Kindle and ebook readers.

This should be prioritized after PDF export.

---

# Future Book Features

## Character Database

```txt
Characters
Locations
Timeline
Notes
```

linked to a book.

---

## Writing Goals

```txt
Target Words

Current Words

Progress
```

---

## Collaboration

Future:

```txt
Co Authors
Editors
Reviewers
```

---

# Future Drama Features

## Character List

```txt
Hamlet
Ophelia
Horatio
Claudius
```

---

## Character Scene Mapping

Example:

```txt
Scene 1

Characters:
✓ Hamlet
✓ Horatio
```

---

## Structured Dialogue

Instead of storing:

```txt
HAMLET:
To be or not to be
```

as raw text,

store:

```ts
{
  speaker: "Hamlet",
  text: "To be or not to be"
}
```

This unlocks:

* Script formatting
* PDF screenplay export
* Character analytics
* Dialogue statistics

---

# Recommended Development Order

Phase 1

* Book model
* Chapter model
* Book CRUD
* Book editor
* Book reader

Phase 2

* Drama model
* Act model
* Scene model
* Drama editor
* Drama reader

Phase 3

* Shared publishing engine
* PDF export

Phase 4

* EPUB export
* Version history
* Reading progress

Phase 5

* Character systems
* Collaboration
* Advanced writing tools

---

# Final Recommendation

Treat Books and Dramas as first-class products.

Do not force them into the existing Content model.

Keep Poems, Stories, and Prose in the current Content system.

Build dedicated Book and Drama modules with their own database models, APIs, editor experiences, reading experiences, publishing flows, and export capabilities.

Share infrastructure, not workflows.

This produces a cleaner architecture, a better user experience, and a platform capable of supporting serious writers, novelists, playwrights, self-publishers, and eventually commercial book publishing.
