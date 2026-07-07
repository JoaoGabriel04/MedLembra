import multer from 'multer'
import { Request, Response, NextFunction } from 'express'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter(_req, file, cb) {
    if (ALLOWED_MIME.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('TIPO_INVALIDO'))
    }
  },
})

export function uploadFotoMiddleware(req: Request, res: Response, next: NextFunction): void {
  upload.single('foto')(req, res, (err) => {
    if (!err) return next()

    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'ARQUIVO_MUITO_GRANDE', message: 'Arquivo excede o limite de 5 MB' })
      return
    }

    if (err instanceof Error && err.message === 'TIPO_INVALIDO') {
      res.status(400).json({ error: 'TIPO_INVALIDO', message: 'Apenas JPEG, PNG e WebP são aceitos' })
      return
    }

    next(err)
  })
}
