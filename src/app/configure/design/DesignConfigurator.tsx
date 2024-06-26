"use client"

import HandleComponent from "@/components/HandleComponent";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatPrice } from "@/lib/utils";
import NextImage from 'next/image';
import { Rnd } from "react-rnd";
import { Description, Radio, RadioGroup } from '@headlessui/react' // "versión @headlessui/react": "^2.0.3"
import { useRef, useState } from "react";
import { COLORS, FINISHES, MATERIALS, MODELS } from "@/validators/option-validator";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ArrowRight, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BASE_PRICE } from "@/config/products";
import { useUploadThing } from "@/lib/uploadthing";
import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { saveConfig as _saveConfig, SaveConfigArgs } from "./actions";
import { useRouter } from 'next/navigation'


interface DesignConfiguratorProps {
  configId: string
  imageUrl: string
  imageDimensions: { width: number; height: number }
}


const DesignConfigurator = ({ configId, imageUrl, imageDimensions }: DesignConfiguratorProps) => {
  
  const { toast } = useToast();
  const router = useRouter()

  const {mutate: saveConfig, isPending} = useMutation({             // saveConfig es la action que graba la config elegida por el usuario en bd
    mutationKey: ["save-config"],                                   // Nombre clave con el que se guarda en cache los resultados de las peticiones
    mutationFn: async (args: SaveConfigArgs) => {                   // Ejecución de las actions: subida a uploadThings y actualización de la bd
      await Promise.all([saveConfiguration(), _saveConfig(args)])
    },
    onError: () => {
      toast({
        title: 'Something went wrong',
        description: 'There was an error on our end. Please try again.',
        variant: 'destructive',
      })
    },
    onSuccess: () => {
      router.push(`/configure/preview?id=${configId}`)
    },
  })

  const [options, setOptions] = useState<{                            // Estado para las opciones del móvil
    color: (typeof COLORS)[number]
    model: (typeof MODELS.options)[number]
    material: (typeof MATERIALS.options)[number]
    finish: (typeof FINISHES.options)[number]
  }>({
    color: COLORS[0],
    model: MODELS.options[0],
    material: MATERIALS.options[0],
    finish: FINISHES.options[0],
  });

  const [renderedDimension, setRenderedDimension] = useState({        // Estado para las dimensiones de la imagen
    width: imageDimensions.width / 4,
    height: imageDimensions.height / 4,
  });

  const [renderedPosition, setRenderedPosition] = useState({          // Posicionamiento por defecto de la imagen subida
    x: 150,
    y: 205,
  });

  const phoneCaseRef = useRef<HTMLDivElement>(null) 
  const containerRef = useRef<HTMLDivElement>(null)

  const { startUpload } = useUploadThing('imageUploader');            // Instancia de la libreria de uploadThings que inicia la subida de files

  async function saveConfiguration() {
    try {
      const {
        left: caseLeft, // Se renombran
        top: caseTop,   
        width,          
        height,         
      } = phoneCaseRef.current!.getBoundingClientRect()   // De la ref de la imagen del movil obtenemos posición y dimensiones
    
      const { 
        left: containerLeft, 
        top: containerTop 
      } =  containerRef.current!.getBoundingClientRect()  // Del div de redimensión y posicionamiento obtenemos su posición
    
      const leftOffset = caseLeft - containerLeft         // Distancia horizontal entre el borde izquierdo de la imagen del móvil y el borde izquierdo del contenedor.
      const topOffset = caseTop - containerTop

      const actualX = renderedPosition.x - leftOffset     // Aquí se cambia la referencia de las coordenadas, pasamos del container al móvil
      const actualY = renderedPosition.y - topOffset      // Hacer este ajuste hace que la posición elegida de la imagen tome como origen la esquina superior izda del movil
      
      const canvas = document.createElement('canvas')     // Se crea un canvas con las mismas dimensiones que la imagen del móvil,
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')

      const userImage = new Image()                       // Se configura y carga la imagen del usuario de forma asíncrona y 
      userImage.crossOrigin = 'anonymous'
      userImage.src = imageUrl
      await new Promise((resolve) => (userImage.onload = resolve))

      ctx?.drawImage(                                     // luego se dibuja en el canvas con las coordenadas y dimensiones ajustadas.
        userImage,                                        // La imagen que se dibuja en el canvas y que luego se almacena en base de datos esta delimitada por la referencia del movil 
        actualX,
        actualY,
        renderedDimension.width,
        renderedDimension.height
      )

      // Convertimos el elemento html canvas a formato png
      const base64 = canvas.toDataURL()                                       // Convierte el contenido del canvas a una URL en Base64, que es una representación de la imagen en formato PNG (data:image/png;base64 + data)
      const base64Data = base64.split(',')[1]                                 // Extrae solo los datos en Base64, eliminando la parte data:image/png;base64,.

      const blob = base64ToBlob(base64Data, 'image/png')                      // Convertimos los datos Base64 a un objeto Blob
      const file = new File([blob], 'filename.png', { type: 'image/png' })    // Crea un objeto File a partir del Blob, con el nombre de archivo filename.png y el tipo de contenido image/png.
    
      await startUpload([file], { configId })                                 // Se vuelve a subir a uploadThing para que se actualize 

    } catch (error) {
      toast({
        title: 'Something went wrong',
        description:
          'There was a problem saving your config, please try again.',
        variant: 'destructive',
      })
    }
  }

  function base64ToBlob(base64: string, mimeType: string) {
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: mimeType })
  }
  
  return(
    <div className="relative mt-20 grid grid-cols-1 lg:grid-cols-3 mb-20 pb-20">
      <div
        ref={containerRef} 
        className='relative h-[37.5rem] overflow-hidden col-span-2 w-full max-w-4xl flex items-center
        justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center focus:outline-none 
        focus:ring-2 focus:ring-primary focus:ring-offset-2'
      >
        <div className='relative w-60 bg-opacity-50 pointer-events-none aspect-[896/1831]'>
          <AspectRatio
            ref={phoneCaseRef}
            ratio={896 / 1831}
            className='pointer-events-none relative z-50 aspect-[896/1831] w-full'
          >
            <NextImage 
              fill
              alt='phone image'
              src='/phone-template.png'
              className='pointer-events-none z-50 select-none'
            />
          </AspectRatio>
          <div className='absolute z-40 inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px] shadow-[0_0_0_99999px_rgba(229,231,235,0.6)]' />
          <div
            className={cn(
              'absolute inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px]',
              `bg-${options.color.tw}`
            )}
          />
        </div>

        <Rnd                                                  // Recibe la imagen subida y permite su redimensión y posicionamiento
          default= {{
            x: 150,
            y: 205,
            height: imageDimensions.height / 4,
            width: imageDimensions.width / 4  
          }}
          onResizeStop={(_, __, ref, ___, { x, y }) => {
            setRenderedDimension({                             // Esta función de rnd obtiene el nuevo tamaño de la imagen subida 
              height: parseInt(ref.style.height.slice(0, -2)), // se elimina "px" de "50px"
              width: parseInt(ref.style.width.slice(0, -2)),
            })

            setRenderedPosition({ x, y })                      // Posición por defecto     
          }}
          onDragStop={(_, data) => {                           // Esta función de rnd obtiene la nueva posición de la imagen cuando se termina de hacer drag  
            const { x, y } = data
            setRenderedPosition({ x, y })
          }}
          className="absolute z-20 border-[3px] border-primary"
          lockAspectRatio
          resizeHandleComponent={{
            bottomRight: <HandleComponent />,
            bottomLeft: <HandleComponent />,
            topRight: <HandleComponent />,
            topLeft: <HandleComponent />,
          }}
          >
          <div className="relative w-full h-full">
            <NextImage 
              src={imageUrl} 
              alt="your image"
              fill
              className="pointer-events-none"  
            />
          </div>
        </Rnd>
      </div>

      <div className='h-[37.5rem] w-full col-span-full lg:col-span-1 flex flex-col bg-white'>
        <ScrollArea className='relative flex-1 overflow-auto'>
          <div
            aria-hidden='true'
            className='absolute z-10 inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white pointer-events-none'
          />

          <div className='px-8 pb-12 pt-8'>
            
            <h2 className='tracking-tight font-bold text-3xl'>
              Customize your case
            </h2>

            <div className='w-full h-px bg-zinc-200 my-6' />

            <div className='relative mt-4 h-full flex flex-col justify-between'>
              <div className='flex flex-col gap-6'>
                <RadioGroup
                  value={options.color}
                  onChange={(val) => {
                    setOptions((prev) => ({
                      ...prev,
                      color: val
                    }))
                  }}
                >
                  <Label>Color: {options.color.label}</Label>
                  <div className='mt-3 flex items-center space-x-3'>
                    {COLORS.map((color) => (
                      <Radio
                        key={color.label}
                        value={color}
                        className={({ disabled, checked }) =>
                          cn(
                            'relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 active:ring-0 focus:ring-0 active:outline-none focus:outline-none border-2 border-transparent',
                            {
                              [`border-${color.tw}`]: disabled || checked,
                            }
                          )
                        }
                      >
                        <span
                          className={cn(
                            `bg-${color.tw}`,
                            'h-8 w-8 rounded-full border border-black border-opacity-10'
                          )}
                        />
                      </Radio>
                    ))}
                  </div>
                </RadioGroup>

                <div className='relative flex flex-col gap-3 w-full'>
                  <Label>Model</Label>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='outline'
                      role='combobox'
                      className='w-full justify-between'>
                      {options.model.label}
                      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {MODELS.options.map((model) => (
                      <DropdownMenuItem
                        key={model.label}
                        className={cn(
                          'flex text-sm gap-1 items-center p-1.5 cursor-default hover:bg-zinc-100',
                          {
                            'bg-zinc-100':
                              model.label === options.model.label,
                          }
                        )}
                        onClick={() => {
                          setOptions((prev) => ({ ...prev, model }))
                        }}>
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            model.label === options.model.label
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        {model.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {[MATERIALS, FINISHES].map(({name, options:selectableOptions}) => ( // selectableOptions = total options
                  // options[name] -> options:material -> MATERIALS.options[0]
                  // options[name] -> options:finishes -> FINISHES.options[0]
                  <RadioGroup 
                    key={name} 
                    value={options[name]} // material.options[0 | 1] | finishes.options[0 | 1]
                    onChange={(val) => {
                      setOptions((prev) => ({
                        ...prev,
                        [name]:val // material | finishes
                      }))
                    }}  
                  >
                    <Label>
                      {name.slice(0, 1).toUpperCase() + name.slice(1)} 
                      <div className='mt-3 space-y-4'>
                        {selectableOptions.map((option) => (  // material.options[0 | 1] | finishes.options[0 | 1]
                          <Radio 
                            key={option.value}
                            value={option}
                            className={({ disabled, checked }:{disabled:boolean, checked:boolean}) => cn(
                              "relative block cursor-pointer rounded-lg bg-white px-6 py-4 shadow-sm border-2 border-zinc-200 focus:outline-none ring-0 focus:ring-0 outline-none sm:flex sm:justify-between",
                              {
                                "border-primary": disabled || checked,
                              }
                            )}  
                          >
                            <span className='flex items-center'>
                              <span className='flex flex-col text-sm'>
                                <Label className='font-medium text-gray-900'>
                                  {option.label}
                                </Label>

                                {option.description ? (
                                  <Description
                                    as='span'
                                    className='text-gray-500'>
                                    <span className='block sm:inline'>
                                      {option.description}
                                    </span>
                                  </Description>
                                ) : null}
                              </span>
                            </span>

                            <Description
                              as='span'
                              className='mt-2 flex text-sm sm:ml-4 sm:mt-0 sm:flex-col sm:text-right'>
                              <span className='font-medium text-gray-900'>
                                {formatPrice(option.price / 100)}
                              </span>
                            </Description>
                          </Radio>
                        ))}
                      </div>
                    </Label>
                  </RadioGroup>
                ))}

              </div>
            </div>

          </div>
        </ScrollArea>

        <div className='w-full px-8 h-16 bg-white'>
          <div className='h-px w-full bg-zinc-200' />
          <div className='w-full h-full flex justify-end items-center'>
            <div className='w-full flex gap-6 items-center'>
              <p className='font-medium whitespace-nowrap'>
                {formatPrice(
                  (BASE_PRICE + options.finish.price + options.material.price) /
                  100
                )}
              </p>
              <Button
                isLoading={isPending}
                disabled={isPending}
                loadingText="Saving"
                onClick={() =>
                  saveConfig({
                    configId,
                    color: options.color.value,
                    finish: options.finish.value,
                    material: options.material.value,
                    model: options.model.value,
                  })
                }
                size='sm'
                className='w-full'>
                Continue
                <ArrowRight className='h-4 w-4 ml-1.5 inline' />
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default DesignConfigurator