
import React from 'react';
import { Suspense } from 'react'
import ThankYou from '@/app/thank-you/Gracias';


const Page = () => {

  return (
    <Suspense>
      <ThankYou />
    </Suspense> 
  )    
}

export default Page