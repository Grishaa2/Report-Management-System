PROJECT MASTER PLAN: WCT_Final Expansion

Role: You are a Senior Full Stack Developer and Project Architect.
Project: WCT_Final (GitHub: Chotakna/WCT_Final)
Objective: Implement 3 specific scopes (Auth, Data CRUD/Vis, Data Expose) into the existing codebase.

🛑 INSTRUCTIONS FOR GEMINI AGENT

Read-Only Mode First: Do not generate code until you have completed Phase 1 (Analysis).

Sequential Execution: Do not proceed to Phase 2 until Phase 1 is confirmed by the user.

Tech Stack Adherence: All code generated must strictly follow the frameworks and languages identified in Phase 1.

🔹 PHASE 1: Discovery & Stack Analysis

Trigger: User says "Execute Phase 1"
Task:

Scan the current working directory recursively.

Identify the core technology stack:

Backend: (e.g., Java Spring, PHP Laravel, Node Express, Python Django)

Frontend: (e.g., React, Vue, Blade, Thymeleaf, Plain HTML/JS)

Database: (e.g., MySQL, PostgreSQL, MongoDB) - Look for config files like application.properties, .env, or database connection files.

Package Managers: (e.g., Maven pom.xml, Composer composer.json, NPM package.json).

Output: A concise summary of the stack and the file structure. Do not write code yet.

🔹 PHASE 2: User Authentication (Scope 1)

Trigger: User says "Execute Phase 2"
Context: The app requires secure access control.
Tasks:

Database: Check if a User entity/table exists. If not, generate the schema/migration for a users table containing:

id (Primary Key)

email (Unique)

password (Hashed)

auth_provider (default: 'local', options: 'google', 'github')

oauth_id (nullable, for social login)

Backend Logic:

Implement/Update the AuthController.

Add Password Hashing (e.g., BCrypt).

Set up Session or JWT handling based on the existing project pattern.

(Optional) Add stub methods for OAuth2 (Google/GitHub) integration.

Frontend:

Generate a Login Form and Registration Form compatible with the current UI theme.

🔹 PHASE 3: User Data CRUD & Visualization (Scope 2)

Trigger: User says "Execute Phase 3"
Context: Users need to manage their own data and see it visualized.
Tasks:

Data Entity: Create a UserData entity (linked to User via Foreign Key).

Fields: id, user_id, data_value (numeric/string), category, created_at.

Import Feature:

Create a backend endpoint to parse CSV uploads.

Map CSV columns to UserData fields.

Save parsed records to the database for the current logged-in user.

Dashboard UI:

Create a Dashboard View.

Table: List user data with 'Edit' and 'Delete' buttons.

Chart: Implement a simple chart (Bar/Line) showing data aggregation (e.g., Sum of values per Category) using a compatible library (e.g., Chart.js).

🔹 PHASE 4: User Data Expose (Scope 3)

Trigger: User says "Execute Phase 4"
Context: Allow public access to specific, non-sensitive user summaries.
Tasks:

Public API: Create a new endpoint: GET /api/public/stats/{userId}.

Security: This endpoint must remain unauthenticated (open to public).

Privacy: It must only return safe data (e.g., public name, total records count, chart data). Never return email or password.

Public Profile Page:

Create a read-only view that consumes this public API.

Display the user's chart and summary stats.

🔹 PHASE 5: Integration Check

Trigger: User says "Execute Phase 5"
Task:

List any new dependencies added (libraries for CSV, Charts, Security).

Provide the exact installation commands (e.g., npm install ... or mvn dependency:resolve).

Verify that the new database tables are properly related.