import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

const FOLDER = process.env.CLOUDINARY_AVATAR_FOLDER ?? 'medismart/avatars'

export async function uploadAvatar(buffer: Buffer, usuarioId: number): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          public_id: `${FOLDER}/${usuarioId}`,
          overwrite: true,
          resource_type: 'image',
          folder: undefined, // public_id já inclui o caminho completo
        },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error('Upload falhou'))
          resolve(result.secure_url)
        }
      )
      .end(buffer)
  })
}

export async function deleteAvatar(usuarioId: number): Promise<void> {
  await cloudinary.uploader.destroy(`${FOLDER}/${usuarioId}`)
}
