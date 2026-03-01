# Hosting Brand OS on Cloudflare Pages (Free Tier)

This application is ready for deployment to Cloudflare Pages. Follow these steps to host it for free.

## 1. Prerequisites
- A **GitHub** account with this repository pushed.
- A **Cloudflare** account.
- **Prisma Accelerator** or a remote database (e.g., Supabase, Neon) since Cloudflare Pages (Edge) cannot host a direct SQLite file on disk.

## 2. Database Setup (Crucial for SaaS)
- Create a free database on [Neon.tech](https://neon.tech/) or [Supabase](https://supabase.com/).
- Update your `.env.local` (located in the project root) with the remote database URL.
- The schema file is located at `prisma/schema.prisma`. Ensure you are in the project root directory.
- Run `npx prisma db push` locally to sync the schema to your remote DB.

## 3. Deployment Steps
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Workers & Pages** > **Create application**.
3. **Important**: Click the **Pages** tab (next to the Workers tab) before clicking **Connect to Git**.
4. In the GitHub connection screen:
   - If your account isn't connected, click **Add Account** and follow the GitHub popup.
   - **Note**: Ensure you grant Cloudflare access to the `brand-toughness-app` repository in the GitHub permissions popup.
   - Once authorized, you will see a search box. Type `brand-toughness-app` to find and select it.
5. Click **Begin setup**.
   - **Framework preset**: `Next.js`
   - **Build command**: `npm run build` 
   - **Build output directory**: `.next` (or leave default)
5. Add **Environment Variables**:
   - `DATABASE_URL`: (From Neon/Supabase)
   - `PHONEPE_MERCHANT_ID`: (Your PhonePe ID)
   - `PHONEPE_SALT_KEY`: (Your PhonePe Salt)
   - `PHONEPE_SALT_INDEX`: (1 by default)
   - `PHONEPE_ENV`: `SANDBOX` or `PRODUCTION`
   - `NEXTAUTH_URL`: `https://your-app.pages.dev`
   - `NEXTAUTH_SECRET`: (Generate a random string)
   - `GOOGLE_CLIENT_ID`: (From Google Cloud Console)
   - `GOOGLE_CLIENT_SECRET`: (From Google Cloud Console)
   - `COHERE_API_KEY`: (Your Cohere API key)
   - `PAGESPEED_API_KEY`: (Your Google Cloud PageSpeed API key)
6. Click **Save and Deploy**.

## 4. Post-Deployment
- Add your new `.pages.dev` domain to the **Authorized redirect URIs** in your Google Cloud Console (for NextAuth).
- Set up the **PhonePe Callback URL** in their merchant dashboard to point to `https://your-app.pages.dev/api/phonepe/callback`.

## 5. Free Tier Considerations
- Cloudflare Pages is extremely fast and free for unlimited bandwidth.
- Ensure your database (Neon/Supabase) has its pooled connection enabled for Serverless environments.
