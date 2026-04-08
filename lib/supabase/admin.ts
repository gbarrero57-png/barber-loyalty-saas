import { createClient } from '@supabase/supabase-js'

// Service role client — bypasses RLS, solo usar en Server Actions
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
