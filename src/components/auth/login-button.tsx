"use client";

type LoginButtonProps = {
  children: React.ReactNode;
  mode?: "modal" | "redirect";
  asChild?: boolean;
};

import { useRouter } from "next/navigation";
import React from "react";

function LoginButton({ children, mode, asChild }: LoginButtonProps) {

 

    const router=useRouter()

    const clickBtn=()=>{
        router.push("/auth/login")
        
    }

       if (mode === "modal") {
         return <span>ToDo : impelment modal</span>;
       }

  return <span className="cursor-pointer" onClick={clickBtn}>{children}</span>;
}

export default LoginButton;
