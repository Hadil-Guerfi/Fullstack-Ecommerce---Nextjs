import { auth, signOut } from '@/auth'
import { Button } from '@/components/ui/button';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';
import React from 'react'

async function SettingsPage() {

    const session=await auth()


  return (
    <div>
      <div>{JSON.stringify(session)}</div>
      <form action={async()=>{
        "use server";
        await signOut({ redirectTo: "/auth/login", redirect: true });
      }}>

        <Button type='submit' >Sign out</Button>

      </form>
    </div>
  );
}

export default SettingsPage