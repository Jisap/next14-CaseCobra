import { createUploadthing, type FileRouter } from "uploadthing/next";
import { z } from "zod";
import sharp from "sharp";
import { db } from "@/db";

const f = createUploadthing();                                                  // Instancia de Uploadthing

//const auth = (req: Request) => ({ id: "fakeId" });                            // función auth que simula la autenticación del usuario


export const ourFileRouter = {                                                  // Enrutador para cargar archivos 
  
  imageUploader: f({ image: { maxFileSize: "4MB" } })                           // imageUploader define la ruta  con el tipo de archivo y la longitud máxima
    
    .input(z.object({configId: z.string().optional()}))                         // Tambíen el tipado del identificador del archivo que devuelve uploadthing

    .middleware(async ({ input}) => {                                           // Aquí se establecen los permisos si los hay.
      
      return { input };                                                         // Lo que se devuelve aquí pasa como metada a la siguiente función
    })
    .onUploadComplete(async ({ metadata, file }) => {                           // Controlador de eventos que se ejecuta despues de completar la carga

      const { configId } = metadata.input                                       // Se recibe el identificador del archivo desde la metadata

      const res = await fetch(file.url)                                         // Se obtiene la imagen desde uploadThing a partir del file
      
      const buffer = await res.arrayBuffer()                                    // La imagen se almacena en un arrayBUffer  

      const imgMetadata = await sharp(buffer).metadata()                        // Se obtiene la metadata de dicha imagen  

      const {width, height } = imgMetadata                                      // y con ella obtenemos el ancho y el alto

      if(!configId){                                                            // Si no tenemos identificador de la imagen subida
        const configuration = await db.configuration.create({                   // creamos una nueva entrada en la bd con los datos de la imagen subida
          data: {
            imageUrl: file.url,
            height: height || 500,
            width: width || 500,
          },
        })

        return { configId: configuration.id }                                    // Devuelve el configId de la imagen
      }

      return {configId };                                                       // y se retorna
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;