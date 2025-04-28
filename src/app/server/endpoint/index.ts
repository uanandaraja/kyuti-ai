import { Hono } from 'hono'
import { upload } from './upload'
import { promptRoutes } from './prompt'

export const api = new Hono()
  .route('/upload', upload)
  .route('/prompt', promptRoutes)