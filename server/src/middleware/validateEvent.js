export function validateEvent(req, res, next) {
  const { session_id, event_type, page_url, timestamp, click_x, click_y } = req.body || {};

  if (!session_id || typeof session_id !== 'string' || session_id.trim() === '') {
    return res.status(400).json({ error: 'session_id is required and must be a non-empty string' });
  }

  if (!event_type || (event_type !== 'page_view' && event_type !== 'click')) {
    return res.status(400).json({ error: "event_type is required and must be either 'page_view' or 'click'" });
  }

  if (!page_url || typeof page_url !== 'string' || page_url.trim() === '') {
    return res.status(400).json({ error: 'page_url is required and must be a non-empty string' });
  }

  try {
    new URL(page_url);
  } catch {
    return res.status(400).json({ error: 'page_url must be a valid URL' });
  }

  if (!timestamp) {
    return res.status(400).json({ error: 'timestamp is required' });
  }

  const parsedDate = new Date(timestamp);
  if (Number.isNaN(parsedDate.getTime())) {
    return res.status(400).json({ error: 'timestamp must parse to a valid Date' });
  }

  if (event_type === 'click') {
    if (
      click_x === null ||
      click_x === undefined ||
      typeof click_x !== 'number' ||
      !Number.isFinite(click_x) ||
      click_y === null ||
      click_y === undefined ||
      typeof click_y !== 'number' ||
      !Number.isFinite(click_y)
    ) {
      return res.status(400).json({
        error: 'click_x and click_y must be finite numbers for click events'
      });
    }
  }

  if (event_type === 'page_view') {
    if (
      (click_x !== null && click_x !== undefined) ||
      (click_y !== null && click_y !== undefined)
    ) {
      return res.status(400).json({
        error: 'click_x and click_y must be null or undefined for page_view events'
      });
    }
  }

  next();
}

export default validateEvent;
