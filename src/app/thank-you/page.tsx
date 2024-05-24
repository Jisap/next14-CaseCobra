

import { Suspense } from 'react'
import ThankYou from '@/app/thank-you/ThankYou';


const Page = () => {

  return (
    <Suspense>
      <ThankYou />
    </Suspense> 
  )    
}

export default Page