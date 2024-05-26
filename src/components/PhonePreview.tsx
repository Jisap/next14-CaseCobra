'use client'

import { CaseColor } from '@prisma/client'
import { useEffect, useRef, useState } from 'react'
import { AspectRatio } from './ui/aspect-ratio'
import { cn } from '@/lib/utils'

const PhonePreview = ({
  croppedImageUrl,
  color,
}: {
  croppedImageUrl: string
  color: CaseColor
}) => {

  const ref = useRef<HTMLDivElement>(null)

  const [renderedDimensions, setRenderedDimensions] = useState({
    height: 0,
    width: 0,
  })

  const handleResize = () => {
    if (!ref.current) return
    const { width, height } = ref.current.getBoundingClientRect()       // Actualiza las dimensiones cuando se cambia el tamaño de la ventana.
    setRenderedDimensions({ width, height })
  }

  useEffect(() => {
    handleResize()

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [ref.current])

  let caseBackgroundColor = 'bg-zinc-950'                               // caseBackgroundColor se determina en función del color del estuche del móvil.
  if (color === 'blue') caseBackgroundColor = 'bg-blue-950'
  if (color === 'rose') caseBackgroundColor = 'bg-rose-950'

  return (
    <AspectRatio ref={ref} ratio={3000 / 2001} className='relative'>
      <div
        className='absolute z-20 scale-[1.0352]'
        style={{
          left:                                                         // left y top se calculan en función del tamaño del contenedor para centrar la imagen en la foto de muestra
            renderedDimensions.width / 2 -                              // Ajuste horizontal para centrar la imagen (mitad de la pantalla - cantidad pequeña a la izda)
            renderedDimensions.width / (1216 / 121),
          top: renderedDimensions.height / 6.22,                        // Ajuste vertical para posicionar correctamente la imagen
        }}>
        <img
          width={renderedDimensions.width / (3000 / 637)}               // Se ajusta en función del ancho actual del contenedor para mantener las proporciones correctas
          className={cn(
            'phone-skew relative z-20 rounded-t-[15px] rounded-b-[10px] md:rounded-t-[30px] md:rounded-b-[20px]',
            caseBackgroundColor
          )}
          src={croppedImageUrl}
        />
      </div>

      <div className='relative h-full w-full z-40'>
        <img
          alt='phone'
          src='/clearphone.png' // Foto de muestra ->Imagen con el móvil en la mano
          className='pointer-events-none h-full w-full antialiased rounded-md'
        />
      </div>
    </AspectRatio>
  )
}

export default PhonePreview