## Getting Started

Add the provided .env file in the root folder of the project.
Then, install dependencies and run the dev server

```bash
npm i
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# PART 1: Backend

Create an API enpoint for a daily checkin. Each user should be able to check in once per day (UTC day). You should keep a counter of how many times the user has checked in.

First, setup an API route for the daily checkin. Feel free to use an hardcoded `userid` in the API route for testing.
Then, use the firebase database to store and keep track of the checkins for the user.

## Follow ups

- Multiple Entries
- Possible flaws of this system/security vulnerabilities?
- How would you implement a "streak" system for daily checkin? ie: calculate how many consecutive days the user has checked in.

# PART 2: Frontend

Implement a UI for `page.tsx` using Tailwind CSS. Complete the following tasks:

- Implement the basic layout: full screen page, navbar, footer and main content
- Design the button as a "Checkin" button
- Connect the button to the backend API route you created in part 1

## Follow ups

- Hover/Focus state for button
- Sidebar
