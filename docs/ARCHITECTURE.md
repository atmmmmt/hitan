# Architecture

## Public flow
`Visitor -> POST /api/public/submissions -> MongoDB Case(moderationStatus=pending)`

## Moderation flow
`Admin login -> HttpOnly JWT cookie -> /api/admin/cases -> approve/reject -> publishedAt`

## Public visibility rule
Every public read query hard-codes `moderationStatus: approved`. Private submitter fields are never included in the public field projection.

## Roles planned
- admin: full moderation + settings
- editor: moderation only

## Next production steps
- image upload storage and virus/content scanning
- audit log for every admin action
- two-factor authentication
- correction/deletion request workflow
- source/provenance fields and confidence labels
- backups, monitoring, rate limiting and WAF
- Arabic search normalization and fuzzy matching
