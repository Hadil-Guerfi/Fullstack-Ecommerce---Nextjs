import React from 'react'
import { logout } from '../../../actions/logout'

function LogoutButton({children}:{children:React.ReactNode}) {
  
    const onClick=()=>{
        logout();
    }
    
    return (
    <span onClick={onClick} className='cursor-pointer'>{children}</span>
  )
}

export default LogoutButton