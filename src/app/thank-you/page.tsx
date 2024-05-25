
import React from 'react';
import { Suspense } from 'react'
//import ThankYou from '@/app/thank-you/Gracias';
import Gracias from '@/app/thank-you/Gracias';


const Page = () => {

  return (
    <Suspense>
      <Gracias/>
    </Suspense> 
  )    
}

export default Page