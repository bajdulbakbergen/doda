import { getUnreadNotificationCount } from "../queries/get-notifications";
import { NotificationsBellRealtime } from "./notifications-bell-realtime";

type Props = { userId: string };

export async function NotificationsBell({ userId }: Props) {
  const initialUnread = await getUnreadNotificationCount();
  return <NotificationsBellRealtime userId={userId} initialUnread={initialUnread} />;
}
