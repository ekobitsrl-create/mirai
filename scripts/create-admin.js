import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xbendkxwuaqrxsyrmgye.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function main() {
  console.log('Creating admin user via Supabase Admin API...')

  const { data: user, error: createError } = await supabase.auth.admin.createUser({
    email: 'admin@mirai.store',
    password: 'MiraiAdmin2025!',
    email_confirm: true,
    user_metadata: { first_name: 'Admin', last_name: 'MIRAI' }
  })

  if (createError) {
    if (createError.message.includes('already been registered')) {
      console.log('User admin@mirai.store already exists, fetching...')
      const { data: { users } } = await supabase.auth.admin.listUsers()
      const existing = users.find(u => u.email === 'admin@mirai.store')
      if (existing) {
        console.log('Found existing user:', existing.id)
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({ id: existing.id, first_name: 'Admin', last_name: 'MIRAI', role: 'admin' })
        if (profileError) console.error('Profile error:', profileError.message)
        else console.log('Profile updated to admin role')
      }
    } else {
      console.error('Error creating user:', createError.message)
      process.exit(1)
    }
  } else {
    console.log('User created:', user.user.id)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: user.user.id, first_name: 'Admin', last_name: 'MIRAI', role: 'admin' })
    if (profileError) console.error('Profile error:', profileError.message)
    else console.log('Admin profile created successfully')
  }

  console.log('')
  console.log('Admin credentials:')
  console.log('  Email:    admin@mirai.store')
  console.log('  Password: MiraiAdmin2025!')
}

main().catch(console.error)
