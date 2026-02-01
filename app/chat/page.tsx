import { requireSubscription } from "@/lib/subscription";
import { ChatUI } from "./ChatUI";

export default async function ChatPage() {
  await requireSubscription();
  return (
    <div className="flex min-h-screen flex-col">
      <ChatUI />
    </div>
  );
}
