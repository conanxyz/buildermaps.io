---
name: "Add Project"
about: "Request to add a new Web3 project to BuilderMaps"
title: "Add Project: <project-name>"
labels: ["add-project"]
assignees: []
---

## Project JSON (required)

> Please paste a **complete JSON** that matches BuilderMaps schema.
> - `id` must be **lowercase kebab-case** and match filename.
> - `links` can include any of the optional link fields.
> - Unknown values: use `null`.

```json
{
  "id": "project-id",
  "name": "Project Name",
  "description": "Brief description of the project",
  "founded": 2020,
  "funding": null,
  "links": {
    "homepage": "https://example.com",
    "logo": "https://example.com/logo.jpg",
    "twitter": "https://x.com/username",
    "telegram": "https://t.me/username",
    "discord": "https://discord.gg/invite",
    "medium": "https://medium.com/@username",
    "github": "https://github.com/org/repo",
    "linkedin": "https://www.linkedin.com/company/companyname",
    "reddit": "https://reddit.com/r/subreddit"
  }
}
