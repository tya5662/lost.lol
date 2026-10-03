# lost.lol

### lost.lol is a profile builder that lets users create a single page for their online presence.
![Screenshot from 2024-11-21 21-20-29](https://github.com/user-attachments/assets/f4e917d9-9767-45ea-8e7e-17437ef6804e)


[v.webm](https://github.com/user-attachments/assets/0dba224f-1209-42cb-9a2b-33208ebd6abd)




## Features

- 🔗 One Link for All Destinations
- ✨ Customizable Beautiful Design
- 🚀 Easy Profile Sharing
- Video and Image Adjustable Background

## Tech Stack

### FrontEnd
- React
- Tailwind CSS
- ShadcnUI
- Aceternity UI
- Lucide React
- TypeScript

### BackEnd
- TypeScript
- NodeJS
- Express
- MongoDB
- Email/password accounts with JWT authentication

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/tya5662/lost.lol.git
```



- Create a `.env` file in `/backend` with:
```bash
PORT=3000
MONGO=mongodb://localhost:27017
JWT_SECRET=  # Random, high-entropy string
FRONTEND_URL=http://localhost:5173
```
- Then:
```bash
cd lost.lol
```
- Run the whole app container
```bash
docker compose up
# Or
# docker-compose up
```

### Or
### Using npm - yarn
- Environment Setup
```bash
cd backend
yarn install
```


- Run the server
```bash
npm run Dev
```



### Running the frontend-
2. Install dependencies
```bash
cd frontend
yarn install
```


- Set `VITE_BACKEND_URL` to the backend URL in the frontend environment.

3. Run the development server
```bash
npm run dev
```

OR

#### Build in production
```bash
npm run build
```
- then serve

```bash
npx serve -s dist -p 5173
```

## Deploying to Vercel

Deploy the frontend and backend as two Vercel projects from this repository:

- Frontend project root: `frontend`. Vercel builds with `npm run build` and serves `dist`; the rewrite keeps profile URLs working on refresh.
- Backend project root: `backend`. Its `vercel.json` deploys the Express app as a Node function.

Set these environment variables in the backend project's Vercel settings for each environment you deploy:

- `MONGO`: MongoDB connection string for a hosted MongoDB deployment. Ensure its network access settings allow connections from Vercel.
- `FRONTEND_URL`: exact deployed frontend origin, for example `https://your-site.vercel.app`.
- `JWT_SECRET`: long, random secret used to sign authentication tokens.

Set `VITE_BACKEND_URL` in the frontend project's Vercel settings to the backend origin, for example `https://your-api.vercel.app`. This value is included in frontend assets, so it must only contain the public API origin, never a secret. Redeploy the frontend after changing it.

Authentication uses email/username and password with JWTs.

