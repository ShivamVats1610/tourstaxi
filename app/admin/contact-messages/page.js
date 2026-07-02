import { listContactMessages } from '@/lib/crm';
import { ContactMessages } from '../_components';

export const metadata = { title: 'Contact Messages | ToursTaxi Admin' };
export const dynamic = 'force-dynamic';

export default async function ContactMessagesPage() {
  const messages = await listContactMessages();
  return <ContactMessages messages={messages} />;
}
