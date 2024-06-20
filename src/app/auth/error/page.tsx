import ErrorCard from '@/components/auth/error-card'
import React from 'react'

//error page displayed in case of error (when trying to login with providers within same email for example this throw an error)
function AuthErrorPage() {
  return (
    <ErrorCard/>
  )
}

export default AuthErrorPage;