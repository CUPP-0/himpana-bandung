import Sidebar from "@/components/Sidebar";
import WhatsAppConnection from "@/components/WhatsAppConnection";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Layout({ children }) {
  if (!await getSession()) redirect("/login");
  return (
    <div className="admin-shell min-h-screen bg-slate-100 text-slate-900">
      <Sidebar />
      <main className="mx-auto w-full max-w-[1500px] px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="mb-5"><WhatsAppConnection /></div>
        {children}
      </main>
    </div>
  );
}