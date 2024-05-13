import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";

const f = createUploadthing();                                                  // Instancia de Uploadthing

//const auth = (req: Request) => ({ id: "fakeId" });                            // función auth que simula la autenticación del usuario


export const ourFileRouter = {                                                  // Enrutador para cargar archivos
  
  imageUploader: f({ image: { maxFileSize: "4MB" } })                           // imageUploader define la ruta  con el tipo de archivo y la longitud máxima
    
    .input(z.object({configId: z.string().optional()}))                         // Tambíen el tipado del identificador del archivo que devuelve uploadthing

    .middleware(async ({ input}) => {                                           // Aquí se establecen los permisos si los hay.
      
      return { input };                                                         // Lo que se devuelve aquí pasa como metada a la siguiente función
    })
    .onUploadComplete(async ({ metadata, file }) => {                           // Controlador de eventos que se ejecuta despues de comlpetar la carga

      const { configId } = metadata.input                                       // Se recibe el identificador del archivo

      return {configId };                                                       // y se retorna
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;