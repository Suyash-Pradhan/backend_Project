import express from 'express'
import { healthcheck } from '../controllers/healthcheck.controller.js'

const router = express.Router()

router.route('/healthcheck').get(healthcheck)

export default router