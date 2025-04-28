import { Hono } from 'hono'
import { upload } from './upload'
import { promptRoutes } from './prompt'
import { imageRoutes } from './image'

export const api = new Hono()
  .route('/upload', upload)
  .route('/prompt', promptRoutes)
  .route('/image', imageRoutes)