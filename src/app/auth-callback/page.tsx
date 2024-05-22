"use client"

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getAuthStatus } from './actions'
import { Loader2 } from 'lucide-react'

const Page = () => {                                               // Despues de loguear kinde llega a esta página http://localhost:3000/auth-callback
  
  const [configId, setConfigId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const configurationId = localStorage.getItem('configurationId') // Comprueba si en local storage existe una entrada: configurationId
    if (configurationId) setConfigId(configurationId)
  }, []);

  const { data } = useQuery({
    queryKey: ['auth-callback'],
    queryFn: async () => await getAuthStatus(),                     // Si existe configurationId -> action -> obtiene la data del user
    retry: true,
    retryDelay: 500,
  })

  if (data?.success) {                                              // Si existe el usuario
    if (configId) {                                                 // y la configId
      localStorage.removeItem('configurationId')                    // se borra la entrada de localStorage
      router.push(`/configure/preview?id=${configId}`)              // y se redirige a /configure/preview?id=${configId} -> configuration -> DesignPreview
    } else {
      router.push('/')
    }
  }

  return (
    <div className='w-full mt-24 flex justify-center'>
      <div className='flex flex-col items-center gap-2'>
        <Loader2 className='h-8 w-8 animate-spin text-zinc-500' />
        <h3 className='font-semibold text-xl'>Logging you in...</h3>
        <p>You will be redirected automatically.</p>
      </div>
    </div>
  )
}

export default Page