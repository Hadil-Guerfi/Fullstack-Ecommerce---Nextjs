import { NavLink } from "@/components/NavLink";
import UserButton from "@/components/auth/user-button";
import { Button } from "@/components/ui/button";
import { currentUser } from "@/lib/auth";
import Link from "next/link";

const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
 
  const user=await currentUser()

  return (
    <>
      <div className="flex items-center justify-around bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800 ">
        <div className="flex items-center justify-around gap-x-8 text-white font-semibold">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/products">Products</NavLink>
          <NavLink href="/orders">My Orders</NavLink>
        </div>
        <div>
          {user ? (
            <UserButton hrefProfil="/profil" />
          ) : (
            <Button asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
      <div className="container my-6">{children}</div>
    </>
  );
}
