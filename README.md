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

## Local Development

To develop and test BuilderMaps locally:

1. **Visit the testnet environment**: Open [https://net-static-dev.chainbasehq.com/buildermaps](https://net-static-dev.chainbasehq.com/buildermaps) in your browser

2. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```
   This will start a local development server at `http://localhost:8080/`

4. **Configure the browser to use your local build**:
   - Open the browser Developer Tools (F12 or right-click → Inspect)
   - Go to the **Application** tab (Chrome) or **Storage** tab (Firefox)
   - Navigate to **Local Storage** → `https://net-static-dev.chainbasehq.com`
   - Add a new entry:
     - **Key**: `import-map-override:@chainbase-labs/buildermaps-io`
     - **Value**: `http://localhost:8080/chainbase-labs-buildermaps-io.js`
   - Refresh the page to load your local changes
  
<img width="1402" height="415" alt="image" src="https://github.com/user-attachments/assets/a907fd80-6a1b-43a4-aa68-cf1cf46cc68b" />


Now you can make changes to the codebase and see them reflected in the testnet environment by reloading the page.

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
  - **`logo`**: URL to the project logo image. You can use either:
    - A local path starting with `/imgs/` (e.g., `/imgs/project-logo.jpg`) - see [Uploading Logo Images](#uploading-logo-images) below
    - A direct external URL (e.g., `https://example.com/logo.jpg`)
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
    "logo": "/imgs/example-project.jpg",
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
   
   **Option A: Using Command Line**
   ```bash
   git clone https://github.com/YOUR_USERNAME/buildermaps.io.git
   cd buildermaps.io
   ```
   
   **Option B: Using GitHub Desktop**
   - Go to your fork's page on GitHub
   - Click the green "Code" button
   - Select "Open with GitHub Desktop"
   - Choose a local path and click "Clone"

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
   
   **Option A: Using Command Line**
   ```bash
   git add public/data/builder-maps.json
   git commit -m "Add [Project Name] to BuilderMaps"
   ```
   
   **Option B: Using GitHub Desktop**
   - Open GitHub Desktop
   - You should see your changes listed in the left sidebar
   - Select `public/data/builder-maps.json` to stage it
   - Write a commit message: "Add [Project Name] to BuilderMaps"
   - Click "Commit to main" (or your branch name)

7. **Push to your fork**:
   
   **Option A: Using Command Line**
   ```bash
   git push origin master
   ```
   
   **Option B: Using GitHub Desktop**
   - Click the "Push origin" button in the top toolbar
   - Or go to Repository → Push

8. **Create a Pull Request** on GitHub with:
    - A clear title describing the addition
    - A description of the project being added
    - Any relevant links or context

### Uploading Logo Images

To upload a project logo image:

1. **Place your logo image** in the `/public/imgs/` directory:
   ```bash
   # Example: Save your logo as project-name.jpg in the imgs folder
   # The file should be at: public/imgs/project-name.jpg
   ```

2. **Reference the image** in `builder-maps.json` using a path starting with `/imgs/`:
   ```json
   {
     "links": {
       "logo": "/imgs/project-name.jpg"
     }
   }
   ```

3. **Commit both files** together:
   ```bash
   git add public/imgs/project-name.jpg
   git add public/data/builder-maps.json
   git commit -m "Add [Project Name] with logo to BuilderMaps"
   ```

**Note**: 
- Use common image formats (`.jpg`, `.png`, `.webp`, etc.)
- Keep file names descriptive and lowercase (e.g., `my-project-logo.jpg`)
- The path must start with `/imgs/` (not `/public/imgs/`)
- Alternatively, you can use an external URL if the logo is hosted elsewhere

### Best Practices

1. **Project Names**: Use the official, commonly recognized name of the project
2. **Descriptions**: Keep descriptions concise (1-2 sentences) and factual
3. **Sectors & Types**: Use existing sector and type names when possible. If you need a new category, mention it in your PR description
4. **Logo Images**: 
   - **Preferred**: Upload logo images to `/public/imgs/` and reference them with `/imgs/filename.jpg` in the JSON
   - **Alternative**: Use direct external image URLs (ending in .jpg, .png, etc.) rather than HTML pages
   - Use descriptive, lowercase filenames for uploaded logos
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

