'use client'

import { HTMLAttributes, useEffect, useRef, useState } from "react"
import MaxWidthWrapper from "./MaxWidthWrapper"
import { useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import Phone from "./Phone";

const PHONES = [
  '/testimonials/1.jpg',
  '/testimonials/2.jpg',
  '/testimonials/3.jpg',
  '/testimonials/4.jpg',
  '/testimonials/5.jpg',
  '/testimonials/6.jpg',
]

function splitArray<T>(array: Array<T>, numParts: number) {         // Divide un array en un número determinado de partes

  const result: Array<Array<T>> = [];                               // Se inicializa una variable result como un array vacío que contendrá arrays de tipo T. Esto se hace para almacenar las partes divididas del array original.

  for (let i = 0; i < array.length; i++) {                          // Bucle for para recorrer el array
    const index = i % numParts                                      // Se calcula el índice de destino utilizando el operador módulo (%). Esto asegura que los elementos se distribuyan equitativamente en las partes.
    if (!result[index]) {
      result[index] = []
    }
    result[index].push(array[i]);                                   // Se añade el elemento actual del array original al array correspondiente en el array de resultado, según el índice calculado.
  }

  return result;                                                    // Se devuelve el array de resultado que contiene las partes divididas.
}

// 3º
function ReviewColumn({                                             // Representa una columna de animación de reviews
  reviews,                                                          
  className,
  reviewClassName,
  msPerPixel = 0,
}: {
  reviews: string[]                                                 // Recibirá un [reviews]
  className?: string                                                // estilos de animación infinito tipo marquesina  
  reviewClassName?: (reviewIndex: number) => string                 // Clases condicionales de visibilidad según indice de [reviews]       
  msPerPixel?: number                                               // Controla la velocidad de la animación de la marquesina
}) {
  const columnRef = useRef<HTMLDivElement | null>(null)
  const [columnHeight, setColumnHeight] = useState(0)
  const duration = `${columnHeight * msPerPixel}ms`

  useEffect(() => {                                                 // Se controla la altura del div donde se hace la animación
    if (!columnRef.current) return                                  // Si el valor de columRef no varia no se hace nada

    const resizeObserver = new window.ResizeObserver(() => {        // Se crea un observable que devuelve true cuando cambia la pantalla 
      setColumnHeight(columnRef.current?.offsetHeight ?? 0)         // Si el valor de columnRef si cambió -> ColumnHeight con el nuevo valor sino 0
    })                                                              // Queda así establecido el nuevo valor en columnRef

    resizeObserver.observe(columnRef.current)                       // Establecemos el nuevo valor de lo que tiene que vigilar el resizeOberserver

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <div
      ref={columnRef}                                                   // Recibe las dimensiones del div de la columna
      className={cn('animate-marquee space-y-8 py-4', className)}       // Animación tipo marquesina
      style={{ '--marquee-duration': duration } as React.CSSProperties} // controla la velocidad de la animación de la marquesina en el componente 
    >
      {reviews.concat(reviews).map((imgSrc, reviewIndex) => (           // Se está iterando sobre el array reviews concatenado consigo mismo (reviews.concat(reviews)), lo que efectivamente duplica las reseñas para crear un efecto de ciclo continuo
        <Review
          key={reviewIndex}
          className={reviewClassName?.(reviewIndex % reviews.length)}   // clase dinámica según función reviewClassName -> visibiliza <Review /> según índice
          imgSrc={imgSrc}
        />
      ))}
    </div>
  )
}


// 4º
interface ReviewProps extends HTMLAttributes<HTMLDivElement> {
  imgSrc: string
}

function Review({ imgSrc, className, ...props }: ReviewProps) {
  const POSSIBLE_ANIMATION_DELAYS = [
    '0s',
    '0.1s',
    '0.2s',
    '0.3s',
    '0.4s',
    '0.5s',
  ]

  const animationDelay =
    POSSIBLE_ANIMATION_DELAYS[
    Math.floor(Math.random() * POSSIBLE_ANIMATION_DELAYS.length)
    ]

  return (
    <div
      className={cn(
        'animate-fade-in rounded-[2.25rem] bg-white p-6 opacity-0 shadow-xl shadow-slate-900/5',
        className
      )}
      style={{ animationDelay }}
      {...props}>
      <Phone imgSrc={imgSrc} />
    </div>
  )
}

// 2º
function ReviewGrid(){
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(containerRef, {once: true, amount: 0.4});
  const columns = splitArray(PHONES, 3);
  const column1 = columns[0]
  const column2 = columns[1]
  const column3 = splitArray(columns[2], 2)


  return (
    <div 
      ref={containerRef}
      className='relative -mx-4 mt-16 grid h-[49rem] max-h-[150vh] grid-cols-1 items-start gap-8 overflow-hidden px-4 sm:mt-20 md:grid-cols-2 lg:grid-cols-3'  
    >
      {isInView ? (
        <>
          <ReviewColumn 
            reviews={[...column1, ...column3.flat(), ...column2]}               // Las columnas separadas anteriormente se unen ahora
            reviewClassName={(reviewIndex) =>                                   // Desarrollamos esta prop. Obteniendo el índice de [reviews]
              cn({                                                              // se mostrará su visibilidad según dicho índice
                'md:hidden': reviewIndex >= column1.length + column3[0].length,
                'lg:hidden': reviewIndex >= column1.length,
              })
            }
            msPerPixel={10}
          />
          <ReviewColumn
            reviews={[...column2, ...column3[1]]}
            className='hidden md:block'
            reviewClassName={(reviewIndex) =>
              reviewIndex >= column2.length ? 'lg:hidden' : ''
            }
            msPerPixel={15}
          />
          <ReviewColumn
            reviews={column3.flat()}
            className='hidden md:block'
            msPerPixel={10}
          />
        </>
      ) : null} 
      <div className='pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-100' />
      <div className='pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-100' />
    </div>
  )
}

// 1º
export function Reviews() {
  return(
    <MaxWidthWrapper className="relative mas-w-5xl">
      <img 
        aria-hidden='true' 
        src='/what-people-are-buying.png'
        className="absolute select-none hidden xl:block -left-32 top-1/3"
        alt=''
      />

      <ReviewGrid />
    </MaxWidthWrapper>
  )

}