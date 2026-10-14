import { Router } from 'express';
import { validateEvent } from '../middleware/validateEvent.js';
import {
  createEvent,
  getSessions,
  getSessionEvents,
  getHeatmapPages,
  getHeatmapClicks
} from '../controllers/eventController.js';
import { getHealth } from '../controllers/healthController.js';

const router = Router();

router.post('/events', validateEvent, createEvent);
router.get('/sessions', getSessions);
router.get('/sessions/:sessionId/events', getSessionEvents);
router.get('/heatmap/pages', getHeatmapPages);
router.get('/heatmap/clicks', getHeatmapClicks);
router.get('/health', getHealth);

export default router;
