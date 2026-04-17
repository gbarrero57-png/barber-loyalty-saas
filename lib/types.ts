export type Shop = {
  id: string
  nombre: string
  slug: string
  logo_url: string | null
  color_primario: string
  email_admin: string
  telefono: string | null
  direccion: string | null
  plan: 'trial' | 'active' | 'cancelled'
  trial_ends_at: string
  active: boolean
  created_at: string
  whatsapp_enabled: boolean
  whatsapp_from: string | null
  onboarding_done?: boolean
  // joined from subscriptions
  subscription_plan?: 'phase1' | 'phase2' | null
  subscription_status?: 'trial' | 'active' | 'paused' | 'cancelled' | null
}

export type Client = {
  id: string
  shop_id: string
  dni_ce: string
  nombre: string
  email: string
  telefono: string | null
  created_at: string
}

export type LoyaltyCard = {
  id: string
  shop_id: string
  client_id: string
  visitas_actuales: number
  tarjetas_completas: number
  premio_pendiente: boolean
  premio_texto: string | null
  updated_at: string
}

export type Visit = {
  id: string
  shop_id: string
  client_id: string
  fecha: string
  premio_aplicado: string | null
}

export type RewardConfig = {
  id: string
  shop_id: string
  tarjeta_num: number
  premio_texto: string
  es_default: boolean
  activo: boolean
}

export type ClientWithCard = Client & {
  card: LoyaltyCard
  nextPremio: string | null
}
