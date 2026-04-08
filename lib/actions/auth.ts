'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) return { error: 'Email o contraseña incorrectos.' }
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function register(formData: FormData) {
  const supabase      = await createClient()
  const admin         = createAdminClient() // bypasses RLS para setup inicial

  const email      = formData.get('email') as string
  const password   = formData.get('password') as string
  const shopNombre = formData.get('shop_nombre') as string
  const shopSlug   = shopNombre.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  // 1. Crear usuario Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
  if (authError || !authData.user) {
    if (authError?.message?.includes('already registered'))
      return { error: 'Ya existe una cuenta con ese email.' }
    return { error: authError?.message ?? 'Error al crear cuenta.' }
  }

  // 2. Crear shop (admin client — sin RLS bloqueando)
  const { data: shop, error: shopError } = await admin
    .from('shops')
    .insert({ nombre: shopNombre, slug: shopSlug, email_admin: email })
    .select('id')
    .single()

  if (shopError) {
    // Si falló el shop, borrar el usuario creado para no dejar orphans
    await admin.auth.admin.deleteUser(authData.user.id)
    if (shopError.code === '23505')
      return { error: 'Ya existe una barbería con ese nombre. Elige otro.' }
    return { error: 'Error al crear la barbería: ' + shopError.message }
  }

  // 3. Vincular usuario → shop (admin client)
  await admin.from('shop_users').insert({
    shop_id: shop.id, user_id: authData.user.id, role: 'owner'
  })

  // 4. Premio default
  await admin.from('rewards_config').insert({
    shop_id: shop.id, tarjeta_num: 1,
    premio_texto: 'Corte gratis', es_default: true, activo: true
  })

  redirect('/')
}
