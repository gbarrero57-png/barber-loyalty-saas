import { getMyShop } from '@/lib/actions/shop'
import { createAdminClient } from '@/lib/supabase/admin'
import HomeUI from '@/components/HomeUI'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const shop = await getMyShop()
  const admin = createAdminClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [{ count: totalClients }, { count: visitasHoy }, { count: premiosPendientes }] = await Promise.all([
    admin.from('clients').select('*', { count: 'exact', head: true }).eq('shop_id', shop!.id),
    admin.from('visits').select('*', { count: 'exact', head: true })
      .eq('shop_id', shop!.id).gte('created_at', today.toISOString()),
    admin.from('loyalty_cards').select('*', { count: 'exact', head: true })
      .eq('shop_id', shop!.id).eq('premio_pendiente', true),
  ])

  const isPhase2 = shop?.subscription_plan === 'phase2'

  return (
    <HomeUI
      totalClients={totalClients ?? 0}
      visitasHoy={visitasHoy ?? 0}
      premiosPendientes={premiosPendientes ?? 0}
      isPhase2={isPhase2}
    />
  )
}
