"use client"
import React from 'react'
import { Button } from '../ui/button'
import { FcGoogle } from 'react-icons/fc'
import { FaGithub } from 'react-icons/fa'
import { signIn, useSession } from 'next-auth/react'
import { useCurrentRole } from '@/hooks/use-current-role'
import { UserRole } from '@prisma/client'
import { useCurrentUser } from '@/hooks/use-current-user'

function Social() {
    const { update } = useSession();

  const userRole=useCurrentRole()

  const user=useCurrentUser()

  const onClick=(provider:"google"|"github")=>{
  console.log({ user });

    signIn(provider,{
      callbackUrl: userRole===UserRole.ADMIN?"/admin":"/",  
      redirect:true,
    })
    update();

  }



  return (
    <div className="flex items-center w-full gap-x-2">
      <Button
        size="lg"
        className="w-full"
        variant="outline"
        onClick={() => {
          onClick("google");
        }}>
        <FcGoogle className="h-5 w-5" />
      </Button>
      <Button
        size="lg"
        className="w-full"
        variant="outline"
        onClick={() => {
          onClick("github");
        }}>
        <FaGithub className="h-5 w-5" />
      </Button>
    </div>
  );
}

export default Social