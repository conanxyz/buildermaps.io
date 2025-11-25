# BuilderMaps

**BuilderMaps is a public good that maps the crypto landscape.**

Most industry ecosystem maps come from VCs showing their portfolio or media outlets pushing their own content. Data platforms lock things behind paywalls. You see pieces, not the whole picture.

**Initiated and sponsored by Chainbase, BuilderMaps is built as an open database.** Anyone can add projects, update info, or explore what exists. All edits are tracked and verifiable. No company controls it, no one decides what gets shown.

Over time it becomes a shared reference for understanding how crypto is actually structured and who's building what.

## Contributing

We welcome contributions from the community! There are several ways to contribute:

- **Add new projects** to the ecosystem map
- **Update existing project information** (descriptions, links, funding, etc.)
- **Suggest new categories or subcategories**
- **Report bugs or suggest improvements**
- **Contribute code improvements** via pull requests

## Adding a New Project

The primary way to add projects to BuilderMaps is by editing the `builder-maps.json` file. This file contains all project data in a structured format.

### File Location

```
public/data/builder-maps.json
```

### Project Data Structure

Each project in `builder-maps.json` follows this structure:

```json
{
  "name": "Project Name",
  "description": "Brief description of the project",
  "sectors": [
    {
      "sector": "Category Name",
      "types": ["Subcategory Name"]
    }
  ],
  "founded": 2020,
  "funding": 1000000,
  "links": {
    "homepage": "https://example.com",
    "logo": "https://example.com/logo.jpg",
    "twitter": "https://x.com/username",
    "telegram": "https://t.me/username",
    "discord": "https://discord.gg/invite",
    "medium": "https://medium.com/@username",
    "github": "https://github.com/username",
    "linkedin": "https://www.linkedin.com/company/companyname",
    "reddit": "https://reddit.com/r/subreddit"
  }
}
```

### Field Descriptions

#### Required Fields

- **`name`** (string): The official name of the project
- **`sectors`** (array): At least one sector entry is required. Each sector entry contains:
  - **`sector`** (string): The main category (e.g., "Stablecoins", "x402", "Public Chain")
  - **`types`** (array of strings): Subcategories within the sector (e.g., ["Infra", "Consumer Apps"])

#### Optional Fields

- **`description`** (string): A brief description of what the project does
- **`founded`** (number | null): The year the project was founded (e.g., 2020). Use `null` if unknown
- **`funding`** (number | string | null): Total funding amount (e.g., 1000000 or "Series A"). Use `null` if unknown
- **`links`** (object): Object containing various links (all optional):
  - **`homepage`**: Main website URL
  - **`logo`**: Direct URL to the project logo image
  - **`twitter`**: X (Twitter) profile URL
  - **`telegram`**: Telegram channel/group URL
  - **`discord`**: Discord server invite URL
  - **`medium`**: Medium publication URL
  - **`github`**: GitHub repository URL
  - **`linkedin`**: LinkedIn company page URL
  - **`reddit`**: Reddit community URL

### Examples

#### Example 1: Simple Project

```json
{
  "name": "Example Project",
  "description": "A decentralized finance platform for lending and borrowing",
  "sectors": [
    {
      "sector": "x402",
      "types": ["Consumer Apps"]
    }
  ],
  "founded": 2023,
  "funding": null,
  "links": {
    "homepage": "https://example.com",
    "logo": "https://example.com/logo.jpg",
    "twitter": "https://x.com/example"
  }
}
```

#### Example 2: Project with Multiple Sectors

A project can belong to multiple sectors by including multiple sector entries:

```json
{
  "name": "Multi-Sector Project",
  "description": "A project that spans multiple categories",
  "sectors": [
    {
      "sector": "Stablecoins",
      "types": ["Infra"]
    },
    {
      "sector": "x402",
      "types": ["Wallet & Payments"]
    }
  ],
  "founded": 2022,
  "funding": 5000000,
  "links": {
    "homepage": "https://multisector.com",
    "logo": "https://multisector.com/logo.jpg",
    "twitter": "https://x.com/multisector",
    "github": "https://github.com/multisector"
  }
}
```

#### Example 3: Project with Multiple Types in One Sector

A project can have multiple subcategories (types) within a single sector:

```json
{
  "name": "Complex Project",
  "description": "A project with multiple subcategories",
  "sectors": [
    {
      "sector": "x402",
      "types": ["Infra & Devtools", "Consumer Apps"]
    }
  ],
  "founded": 2021,
  "funding": null,
  "links": {
    "homepage": "https://complex.com",
    "logo": "https://complex.com/logo.jpg"
  }
}
```

### Step-by-Step Guide to Add a Project

1. **Fork the repository** on GitHub

2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/buildermaps.io.git
   cd buildermaps.io
   ```

3. **Open the JSON file**:
   ```bash
   open public/data/builder-maps.json
   ```
   Or use your preferred text editor.

4. **Add your project entry**: Copy the structure from an existing project and modify it with your project's information. Make sure to:
   - Use proper JSON syntax (commas, quotes, brackets)
   - Match the exact structure shown in examples
   - Use valid URLs for links
   - Use appropriate sector and type names (check existing entries for valid values)

5. **Validate JSON syntax**: Ensure your JSON is valid. You can use:
   - An online JSON validator
   - Your code editor's JSON validation
   - Command line: `node -e "JSON.parse(require('fs').readFileSync('public/data/builder-maps.json', 'utf8'))"`

6. **Commit your changes**:
   ```bash
   git add public/data/builder-maps.json
   git commit -m "Add [Project Name] to BuilderMaps"
   ```

7. **Push to your fork**:
   ```bash
   git push origin master
   ```

8. **Create a Pull Request** on GitHub with:
    - A clear title describing the addition
    - A description of the project being added
    - Any relevant links or context

### Best Practices

1. **Project Names**: Use the official, commonly recognized name of the project
2. **Descriptions**: Keep descriptions concise (1-2 sentences) and factual
3. **Sectors & Types**: Use existing sector and type names when possible. If you need a new category, mention it in your PR description
4. **Logo URLs**: Use direct image URLs (ending in .jpg, .png, etc.) rather than HTML pages
5. **URLs**: Always use full URLs with `https://` protocol
6. **Funding**: Use numbers for dollar amounts (e.g., `1000000` for $1M) or strings for funding rounds (e.g., `"Series A"`)
7. **Founded Year**: Use a 4-digit year (e.g., `2023`), or `null` if unknown
8. **JSON Formatting**: Maintain consistent formatting with the rest of the file
9. **Alphabetical Order**: Try to maintain alphabetical order when adding new projects

### Common Sectors

Based on the current data, common sectors include:
- `x402`
- `Stablecoins`
- `Public Chain`
- And more on the way...

### Common Types (Subcategories)

Common types vary by sector but include:
- `Infra` / `Infra & Devtools`
- `Consumer Apps`
- `Wallet & Payments`
- `Chains & Protocols`
- `Emerging`
- `Crypto Backed`
- `T-Bills Backed`
- And many more...

Check existing entries in `builder-maps.json` to see what types are used for each sector.

## Updating Existing Projects

To update an existing project:

1. Find the project entry in `builder-maps.json`
2. Modify the relevant fields
3. Follow the same commit and PR process as adding a new project
4. In your PR, clearly describe what information was updated and why

## Code of Conduct

- Be respectful and constructive in all interactions
- Focus on factual, accurate information
- Follow the project's coding standards and conventions
- Help maintain the quality and integrity of the data

## Questions?

If you have questions about contributing:
- Open an issue on GitHub
- Check existing issues and pull requests for similar questions
- Review the codebase to understand how data is processed

## License

This project is open source. Please check the LICENSE file for details.

---

**Thank you for contributing to BuilderMaps!** Your contributions help make crypto ecosystem data more accessible and transparent for everyone.

