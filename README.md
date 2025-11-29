# Resll - The Ultimate Reseller Tool

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory (copy `.env.example`) and add your keys:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
   - `VITE_API_KEY`: Your Google Gemini API Key

3. **Run Locally**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```
   The output will be in the `dist` folder.

## Supabase Setup
See `src/SETUP.md` for SQL definitions required for the database.
