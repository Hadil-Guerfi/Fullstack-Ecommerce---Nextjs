import Nav from "@/components/Nav";
import { NavLink } from "@/components/NavLink";
import UserButton from "@/components/auth/user-button";

const dynamic = "force-dynamic";

export default  function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <>
      <div className="flex items-center justify-around bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800 ">
        <div className="flex items-center justify-around gap-x-8 text-white font-semibold">
          <NavLink href="/admin">Dashboard</NavLink>
          <NavLink href="/admin/products">Products</NavLink>
          <NavLink href="/admin/users">Customers</NavLink>
          <NavLink href="/admin/orders">Sales</NavLink>
        </div>



        <UserButton hrefProfil="/admin/profil" />


      </div>
      <div className="container my-6">{children}</div>
    </>
  );
}
