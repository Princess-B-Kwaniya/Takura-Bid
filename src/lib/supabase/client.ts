import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fsloinrsdnpvgsswbbzz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzbG9pbnJzZG5wdmdzc3diYnp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTY1MzYsImV4cCI6MjA4NzUzMjUzNn0.euXZ1T4VIDdwzmmGSNLgjj1lLEF9sMw4Ddb-qKu4Cvo'

const _client = createSupabaseClient(supabaseUrl, supabaseAnonKey)

export function createClient() {
  return _client
}
