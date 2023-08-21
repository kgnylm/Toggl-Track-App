import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nmxnikisivwiyfwsntrs.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teG5pa2lzaXZ3aXlmd3NudHJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk5MjU3OTIsImV4cCI6MjAwNTUwMTc5Mn0._fLpoqs2lWL6478e8W0iC5HYYV-ypUFNhyGGxQLeiBM";

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
