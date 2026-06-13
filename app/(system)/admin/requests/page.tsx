import { AdminRequestsView } from '@/components/admin-requests-view'

export const metadata = {
  title: 'คำขอเพลง | Admin',
  description: 'จัดการคำขอเพลงจากลูกค้า',
}

export default function RequestsPage() {
  return <AdminRequestsView />
}
