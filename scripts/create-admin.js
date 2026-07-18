import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xbendkxwuaqrxsyrmgye.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'mattyventura02@gmail.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const ADMIN_FIRST_NAME = process.env.ADMIN_FIRST_NAME || 'Matty'
const ADMIN_LAST_NAME = process.env.ADMIN_LAST_NAME || 'Ventura'

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required')
  process.exit(1)
}

if (!ADMIN_PASSWORD) {
  console.error('ADMIN_PASSWORD is required')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function main() {
  console.log(`Creating admin user via Supabase Admin API: ${ADMIN_EMAIL}`)

  const { data: user, error: createError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { first_name: ADMIN_FIRST_NAME, last_name: ADMIN_LAST_NAME }
  })

  if (createError) {
    if (createError.message.includes('already been registered')) {
      console.log(`${ADMIN_EMAIL} already exists, fetching...`)
      const { data: { users } } = await supabase.auth.admin.listUsers()
      const existing = users.find(u => u.email === ADMIN_EMAIL)
      if (existing) {
        console.log('Found existing user:', existing.id)
        const { error: passwordError } = await supabase.auth.admin.updateUserById(existing.id, {
          password: ADMIN_PASSWORD,
          email_confirm: true,
          user_metadata: { first_name: ADMIN_FIRST_NAME, last_name: ADMIN_LAST_NAME }
        })
        if (passwordError) console.error('Password update error:', passwordError.message)
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({ id: existing.id, first_name: ADMIN_FIRST_NAME, last_name: ADMIN_LAST_NAME, role: 'admin' })
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
      .upsert({ id: user.user.id, first_name: ADMIN_FIRST_NAME, last_name: ADMIN_LAST_NAME, role: 'admin' })
    if (profileError) console.error('Profile error:', profileError.message)
    else console.log('Admin profile created successfully')
  }

  console.log('')
  console.log('Admin credentials:')
  console.log(`  Email:    ${ADMIN_EMAIL}`)
  console.log(`  Password: ${ADMIN_PASSWORD}`)
}

main().catch(console.error)
