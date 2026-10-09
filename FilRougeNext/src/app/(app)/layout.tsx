import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) redirect("/login");
  if (!session.user.onboarded) redirect("/onboarding");

  return (
    <div className="flex h-screen bg-[#0D0D0D] overflow-hidden">
      <AppSidebar user={session.user} isAdmin={session.user.role === "ADMIN"} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader user={session.user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
