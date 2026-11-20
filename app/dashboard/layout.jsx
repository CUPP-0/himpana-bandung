import Sidebar from "@/components/Sidebar";
import WhatsAppConnection from "@/components/WhatsAppConnection";
import WhatsAppGroups from "@/components/WhatsAppGroups";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Layout({ children }) {
  if (!await getSession()) redirect("/login");

  return (
    <div className="shell">
      <Sidebar />
      <main className="main">
        <header className="topbar">
          <b>HIMPANA Bandung</b>
          <span>Administrator</span>
        </header>
        <section className="content">
          <WhatsAppConnection />
          <WhatsAppGroups />
          {children}
        </section>
      </main>
    </div>
  );
}
