'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

// ── Auth helpers ─────────────────────────────────────────────

export async function getSuperAdminUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const superAdminEmail = process.env.SUPERADMIN_EMAIL
  if (!superAdminEmail) return null

  // Acepta cualquiera de los emails separados por coma
  const emails = superAdminEmail.split(',').map(e => e.trim().toLowerCase())
  if (!emails.includes(user.email?.toLowerCase() ?? '')) return null

  return user
}

export async function requireSuperAdmin() {
  const user = await getSuperAdminUser()
  if (!user) redirect('/superadmin/login')
  return user
}

export async function superAdminLogin(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: 'Credenciales incorrectas.' }

  // Verificar que sea superadmin
  const superAdminEmail = process.env.SUPERADMIN_EMAIL ?? ''
  const emails = superAdminEmail.split(',').map(e => e.trim().toLowerCase())
  if (!emails.includes(email.toLowerCase())) {
    await supabase.auth.signOut()
    return { error: 'No tienes acceso al panel de administración.' }
  }

  redirect('/superadmin')
}

export async function superAdminLogout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/superadmin/login')
}

// ── Data queries ─────────────────────────────────────────────

export async function getAllShops() {
  await requireSuperAdmin()
  const admin = createAdminClient()

  const { data } = await admin
    .from('shops')
    .select('*, subscriptions(*)')
    .order('created_at', { ascending: false })

  return data ?? []
}

export async function getAdminStats() {
  await requireSuperAdmin()
  const admin = createAdminClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { count: totalShops },
    { count: activeShops },
    { count: trialShops },
    { count: pausedShops },
    { data: paymentsThisMonth },
    { count: newThisMonth },
  ] = await Promise.all([
    admin.from('shops').select('*', { count: 'exact', head: true }),
    admin.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    admin.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'trial'),
    admin.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'paused'),
    admin.from('payments').select('monto').gte('fecha', startOfMonth),
    admin.from('shops').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
  ])

  const mrrActual = paymentsThisMonth?.reduce((sum, p) => sum + Number(p.monto), 0) ?? 0

  return {
    totalShops: totalShops ?? 0,
    activeShops: activeShops ?? 0,
    trialShops: trialShops ?? 0,
    pausedShops: pausedShops ?? 0,
    mrrActual,
    newThisMonth: newThisMonth ?? 0,
  }
}

// ── Mutations ─────────────────────────────────────────────────

export async function setShopPlan(shopId: string, plan: 'phase1' | 'phase2') {
  await requireSuperAdmin()
  const admin = createAdminClient()

  await admin.from('subscriptions').upsert({
    shop_id: shopId,
    plan,
    precio_mes: plan === 'phase1' ? 79 : 199,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'shop_id' })

  await admin.from('shops').update({ plan: plan === 'phase1' ? 'active' : 'active' }).eq('id', shopId)
}

export async function setShopStatus(shopId: string, status: 'active' | 'paused' | 'cancelled') {
  await requireSuperAdmin()
  const admin = createAdminClient()

  await admin.from('subscriptions').upsert({
    shop_id: shopId,
    status,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'shop_id' })

  await admin.from('shops').update({ active: status === 'active' }).eq('id', shopId)
}

export async function extendTrial(shopId: string, days: number) {
  await requireSuperAdmin()
  const admin = createAdminClient()

  const newEnd = new Date(Date.now() + days * 86400000).toISOString()
  await admin.from('subscriptions').upsert({
    shop_id: shopId,
    status: 'trial',
    trial_ends_at: newEnd,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'shop_id' })

  await admin.from('shops').update({ trial_ends_at: newEnd, active: true }).eq('id', shopId)
}

export async function setBotConfig(shopId: string, formData: FormData) {
  await requireSuperAdmin()
  const admin = createAdminClient()
  const enabled = formData.get('bot_enabled') === 'true'
  const number = (formData.get('bot_twilio_number') as string)?.trim() || null
  await admin.from('shops').update({ bot_enabled: enabled, bot_twilio_number: number }).eq('id', shopId)
  const { revalidatePath } = await import('next/cache')
  revalidatePath(`/superadmin/shops/${shopId}`)
}

export async function recordPayment(formData: FormData) {
  const user = await requireSuperAdmin()
  const admin = createAdminClient()

  const shopId = formData.get('shop_id') as string
  const monto = Number(formData.get('monto'))
  const metodo = formData.get('metodo') as string
  const referencia = formData.get('referencia') as string
  const periodo = formData.get('periodo') as string
  const notas = formData.get('notas') as string

  await admin.from('payments').insert({
    shop_id: shopId, monto, metodo, referencia, periodo, notas,
    registrado_por: user.id,
  })

  // Activar la suscripción si estaba en trial/paused
  await admin.from('subscriptions').upsert({
    shop_id: shopId, status: 'active',
    siguiente_cobro: new Date(Date.now() + 30 * 86400000).toDateString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'shop_id' })

  await admin.from('shops').update({ active: true, plan: 'active' }).eq('id', shopId)
}
