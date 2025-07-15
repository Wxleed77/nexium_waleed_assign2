Article Summarizer
This repository contains the solution for Assignment 2: Blog Summariser, developed as part of the Nexium Internship Program.
"AI Article Insight" is a web application designed to quickly extract the core essence of any online article and provide a concise summary, specifically translated into Urdu. It leverages modern web technologies to offer a sleek, professional, and intuitive user experience.
Features
•	URL-Based Summarization: Input any valid blog post or article URL to generate a summary.
•	AI-Powered Summarization (Simulated): Integrates with a third-party API (RapidAPI) to provide an article summary.
•	Urdu Translation: The generated summary is provided directly in Urdu, catering to Urdu-speaking users.
•	Data Persistence:
o	Full Text Storage: Original scraped article text is intended to be saved in MongoDB.
o	Summary Storage: The generated Urdu summary is intended to be saved in Supabase.
•	Professional Glassmorphism UI: Features a modern, aesthetically pleasing user interface with subtle glassmorphism effects and a clean design.
•	Responsive Design: Optimized for seamless viewing and interaction across various devices (desktop, tablet, mobile).
Tech Stack
•	Frontend:
o	Next.js: React framework for building the web application.
o	React: JavaScript library for building the user interface.
o	TypeScript: Typed superset of JavaScript for enhanced code quality and maintainability.
o	Tailwind CSS: Utility-first CSS framework for rapid and customizable styling.
o	ShadCN UI: Re-usable UI components for building the form elements and display cards.
o	Lucide React: For crisp, customizable icons.
•	Backend (within Next.js API Routes):
o	Node.js: JavaScript runtime environment for server-side logic.
o	Axios: Promise-based HTTP client for making API requests (e.g., to RapidAPI).
o	Cheerio: Fast, flexible, and lean implementation of core jQuery specifically for the server, used for HTML parsing/scraping.
o	RapidAPI (Article Extractor & Summarizer): Third-party API for article summarization and translation.
•	Databases:
o	MongoDB: NoSQL database (via MongoDB Atlas) for storing the full scraped text.
o	Supabase: Open-source Firebase alternative (PostgreSQL) for storing generated summaries.
•	Deployment:
o	Vercel: Platform for deploying the Next.js application with continuous integration.
Getting Started
Follow these instructions to set up and run the project locally for development.
Prerequisites
Ensure you have the following installed on your machine:
•	Node.js (LTS version): Includes npm (Node Package Manager).
•	Git: For version control.
•	RapidAPI Key: Obtain a key from RapidAPI for the "Article Extractor & Summarizer" API.
•	MongoDB Atlas Account: Set up a free cluster and obtain your connection URI.
•	Supabase Account: Set up a free project and create a summaries table, then obtain your Project URL and anon key.
Installation and Local Development
1.	Clone the repository:
2.	git clone https://github.com/Wxleed77/Nexium_Waleed_Assignment2.git nexium_waleed_assignment2

(Note: The local folder name is lowercase as per npm naming conventions.)
3.	Navigate into the project directory:
4.	cd nexium_waleed_assignment2

5.	Install dependencies:
6.	npm install
7.	# or yarn install
8.	# or pnpm install

9.	Set up Environment Variables: Create a file named .env.local in the root of this project (nexium_waleed_assignment2/.env.local) and add your API keys and database connection strings:
10.	RAPIDAPI_KEY="YOUR_RAPIDAPI_KEY_HERE"
11.	MONGODB_URI="YOUR_MONGODB_ATLAS_CONNECTION_URI_HERE"
12.	SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL_HERE"
13.	SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY_HERE"

Important: Do NOT commit this .env.local file to Git! It's automatically ignored.
14.	Run the development server:
15.	npm run dev
16.	# or yarn dev
17.	# or pnpm dev

Open http://localhost:3000 in your browser to see the application.
Deployment
This application is configured for continuous deployment on Vercel.
1.	Ensure your project is pushed to the main branch of this GitHub repository.
2.	In your Vercel dashboard, import this GitHub repository.
3.	When configuring the project on Vercel, ensure the Root Directory is set to / (since the Next.js project is at the root of this repository).
4.	Crucially, add your RAPIDAPI_KEY, MONGODB_URI, SUPABASE_URL, and SUPABASE_ANON_KEY as Environment Variables in your Vercel project settings.
Once configured, Vercel will automatically build and deploy your application on every push to the main branch.
Live Demo: https://nexium-waleed-assign2.vercel.app

