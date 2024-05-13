"use client"

import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { Image, Loader2, MousePointerSquareDashed } from "lucide-react"
import { useState, useTransition } from "react"
import Dropzone, { FileRejection } from "react-dropzone"
import { type ClassValue } from 'clsx';
import { Progress } from "@/components/ui/progress"
import { useUploadThing } from "@/lib/uploadthing"
import { useRouter } from "next/navigation"



const Page = () => {
  
  const { toast } = useToast()
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const router = useRouter()

  const { startUpload, isUploading } = useUploadThing('imageUploader', { // Esta función es un hook de React que proporciona acceso a las funciones y estados relacionados con UploadThing.
    onClientUploadComplete: ([data]) => {                                // Cuando se completa la subida al servidor se obtiene la data del server                            
      const configId = data.serverData.configId                          // De la data obtenemos el identificador del archivo subido 
      startTransition(() => {                                            // starTransition: cualquier cambio de estado que ocurra después de esa llamada se pospone hasta que la transición esté lista para ocurrir. 
        router.push(`/configure/design?id=${configId}`)                  // y redireccionamos a la página de design/configId 
      })
    },
    onUploadProgress(p){
      setUploadProgress(p)
    }
  })                           

  const onDropRejected = (rejectedFiles: FileRejection[]) => {
    const [file] = rejectedFiles;
    setIsDragOver(false);
    toast({
      title: `${file.file.type} type is not supported.`,
      description: "Please choosea PNG, JPG, or JPEG image instead.",
      variant: "destructive"
    })
  }

  const onDropAccepted = (acceptedFiles: File[]) => {
    startUpload(acceptedFiles, {configId: undefined})
    setIsDragOver(false)
  }


  const [isPending, startTransition] = useTransition()  // Controla transiciones entre diferentes estados de renderizado en la aplicación.

  return (
    <div
      className={cn(
        'relative h-full flex-1 my-16 w-full rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl flex justify-center flex-col items-center',
        {
          'ring-blue-900/25 bg-blue-900/10': isDragOver,
        }
      )}
      >
      <div className='relative flex flex-1 flex-col items-center justify-center w-full'>
        <Dropzone
          onDropRejected={onDropRejected}
          onDropAccepted={onDropAccepted}
          accept={{
            'image/png': ['.png'],
            'image/jpeg': ['.jpeg'],
            'image/jpg': ['.jpg'],
          }}
          onDragEnter={() => setIsDragOver(true)}
          onDragLeave={() => setIsDragOver(false)}
        >
          {({ getRootProps, getInputProps }) => (
            <div
              className='h-full w-full flex-1 flex flex-col items-center justify-center'
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              {isDragOver 
                ? <MousePointerSquareDashed className="h-6 w-6 text-zinc-500 mb-2" /> 
                : isUploading || isPending 
                  ? <Loader2 className="animate-spin h-6 w-6 text-zinc-500 mb-2"/> 
                  : <Image className="h-6 w-6 text-zinc-500 mb-2"  />
              }
              <div className="flex flex-col justify-center mb-2 text-sm text-zinc-700">
                {isUploading 
                  ? <div className="flex flex-col items-center">
                      <p>Uploading...</p>
                      <Progress value={uploadProgress} className="mt-2 w-40 h-2 bg-gray-300"/>
                    </div>
                  : isPending
                    ? <div className="flex flex-col items-center">
                        <p>Redirecting, please wait...</p>
                      </div>
                    : isDragOver
                      ? <p>
                          <span className="font-semibold">Drop file</span>
                          to upload
                        </p>
                      : <p>
                          <span className="font-semibold">Click to upload</span>{' '}
                          or drag and drop
                        </p>
                }
              </div>

              {isPending ? null : <p className="text-xs text-zinc-500">PNG, JPG, JPEG</p>}

            </div>
          )}
        </Dropzone>
      </div>
    </div>
  )
}

export default Page