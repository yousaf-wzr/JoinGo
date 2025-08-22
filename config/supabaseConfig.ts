import { createClient } from "@supabase/supabase-js";

// Your credentials here
const SUPABASE_URL = "https://viktelipdubtbbqasahx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpa3RlbGlwZHVidGJicWFzYWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MDI2MTEsImV4cCI6MjA3MDE3ODYxMX0.-gIE__QfY2xaBF8f3k_6i-mIFPrsLWpj_fcveW2btaE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
