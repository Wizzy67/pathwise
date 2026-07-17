# Project Deployment Instructions

When preparing PathWise for production deployment, make sure to configure the following services:

## Google Sign-In (OAuth 2.0)
- Register the live production domain URL in the **Google Cloud Console** under APIs & Services > Credentials.
- Set the authorized redirect origins and JavaScript origins.
- Set the production environment variables on the hosting platform (e.g. Vercel, Render, AWS, Heroku):
  - **Client**: `VITE_GOOGLE_CLIENT_ID`
  - **Server**: `GOOGLE_CLIENT_ID`
