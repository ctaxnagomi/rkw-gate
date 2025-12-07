Project URL: <https://tlxtfzlvfnibnxquxdnb.supabase.co>
API key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRseHRmemx2Zm5pYm54cXV4ZG5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwODkxMzEsImV4cCI6MjA4MDY2NTEzMX0.UbJg0YVCffooFKrOPfdVBCImuHEtwwHRRUXTT-pYVTQ

Js :
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = '<https://tlxtfzlvfnibnxquxdnb.supabase.co>'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)
