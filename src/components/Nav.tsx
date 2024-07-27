
import React, {  ReactNode } from 'react'

function Nav({children}:{children:ReactNode}) {
  return (
    <nav className="bg-primary text-primary-foreground flex justify-center px-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800">
      {children}
    </nav>
  );
}

export default Nav


