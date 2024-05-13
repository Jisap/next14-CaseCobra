import { OurFileRouter } from '../app/api/uploadthing/core'
import { generateReactHelpers } from '@uploadthing/react'

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>()

// generateReactHelpers genera funciones útiles para interactuar con UploadThing
// useUploadThing: Esta función es un hook de React que proporciona acceso a las funciones y estados relacionados con UploadThing.
// uploadFiles: Esta función te permite cargar archivos utilizando las configuraciones definidas en OurFileRouter.