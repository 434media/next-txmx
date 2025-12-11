# TXMX Boxing

### Project Structure

The application is organized into several key directories:

*   `app/`: The core of the Next.js application, using the App Router.
    *   `app/page.tsx`: The main entry point and landing page.
    *   `app/layout.tsx`: The root layout for the application.
    *   `app/components/`: Contains all reusable React components like [`Navbar`](app/components/navbar.tsx), [`HeroSection`](app/components/hero-section.tsx), and [`Newsletter`](app/components/newsletter.tsx).
    *   `app/api/`: Houses API routes, such as the [`newsletter` subscription endpoint](app/api/newsletter/route.ts).
    *   `app/lib/`: Contains utility functions, like [`cn`](app/lib/utils.ts) for merging class names.
*   `public/`: Stores static assets like images, fonts, and the [`manifest.json`](public/manifest.json).
*   `styles/`: Global styles and Tailwind CSS configuration.

## Getting Started: Running Locally

To get a copy of the project up and running on your local machine, follow these steps.

### 1. Clone the Repository

```sh
git clone <your-repository-url>
cd next-txmx
```

### 2. Set Up Environment Variables

Create a file named `.env.local` in the root of the project. You will need to get the following keys from the project administrator.

```env
# Airtable Configuration
AIRTABLE_BASE_ID=your_airtable_base_id
AIRTABLE_API_KEY=your_airtable_api_key

# Cloudflare Turnstile Keys
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key
```

### 3. Install Dependencies

Install the project dependencies using npm:

```sh
npm install
```

### 4. Run the Development Server

Start the Next.js development server. The project is configured to use Turbopack for faster development.

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## GitHub Collaboration Workflow

We follow a standard feature-branch workflow. All new work should be done on a dedicated branch and merged into `main` via a Pull Request (PR).

### Step 1: Sync Your Local `main` Branch

Before starting new work, ensure your local `main` branch is up-to-date with the remote repository.

```sh
git checkout main
git pull origin main
```

### Step 2: Create a New Branch

Create a new branch from `main`. Use a descriptive naming convention, such as `feature/your-feature-name` or `fix/your-bug-fix`.

```sh
# Example for a new feature
git checkout -b feature/add-fighter-profiles
```

### Step 3: Make and Commit Changes

Make your code changes. Once you have a logical set of changes, stage and commit them with a clear message. We encourage using [Conventional Commits](https://www.conventionalcommits.org/) format.

```sh
# Stage all changes
git add .

# Commit with a conventional message
git commit -m "feat: Add initial structure for fighter profile pages"
```

### Step 4: Push Your Branch to GitHub

Push your new branch to the remote repository. The `-u` flag sets the upstream branch for future pushes.

```sh
git push -u origin feature/add-fighter-profiles
```

### Step 5: Create a Pull Request (PR)

1.  Go to the repository on GitHub in your web browser.
2.  You will see a prompt to create a Pull Request from your recently pushed branch. Click **"Compare & pull request"**.
3.  Give your PR a clear title and a detailed description of the changes.
4.  Assign reviewers and any relevant labels.
5.  Click **"Create pull request"**.

### Step 6: Code Review and Merge

Your PR will be reviewed by other team members. They may request changes. Once the PR is approved and passes all checks, it will be merged into the `main` branch by a repository maintainer.

### Step 7: Clean Up

After your PR is merged, you can safely delete your branch to keep the repository clean.

```sh
# Switch back to the main branch
git checkout main

# Delete the local branch
git branch -d feature/add-fighter-profiles
```

You can also delete the remote branch from the GitHub