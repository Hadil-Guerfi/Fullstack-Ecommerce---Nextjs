"use client"
import { auth, signOut } from '@/auth'
import { Button } from '@/components/ui/button';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';
import { useSession } from 'next-auth/react';
import React from 'react'
import { logout } from '../../../../actions/logout';
import { useCurrentUser } from '@/hooks/use-current-user';

 function SettingsPage() {


  const user = useCurrentUser();

  const onClick= ()=>{
     logout();
  }

  return (
    <div className='bg-white p-10 rounded-e-xl'>
      <Button onClick={onClick} type="submit">
        Sign out
      </Button>
    </div>
  );
}

export default SettingsPage