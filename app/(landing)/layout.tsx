import React from 'react'

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className='bg-background'>{children}</main>
  )
}

export default LandingLayout