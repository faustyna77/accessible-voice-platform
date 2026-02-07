'use client';
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import { AuthProvider } from "../app/context/AuthContext";
import { Toaster } from "sonner";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavbar = ["/login", "/register", "/reset-password"].includes(pathname);

  return (
    <>
      <AuthProvider>
        {!hideNavbar && <Navbar />}
        {children}
      </AuthProvider>
      <Toaster />
    </>
  );
}