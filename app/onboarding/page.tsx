import { getMyShop } from '@/lib/actions/shop'
import { redirect } from 'next/navigation'
import OnboardingWizard from './OnboardingWizard'

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const shop = await getMyShop()
  if (!shop) redirect('/login')
  if (shop.onboarding_done) redirect('/home')
  return <OnboardingWizard shopNombre={shop.nombre} />
}
