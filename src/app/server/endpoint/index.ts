import { Hono } from 'hono'
import { upload } from './upload'

// combine all route groups
export const api = new Hono()
  .route('/upload', upload)