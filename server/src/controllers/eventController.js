import Event from '../models/Event.js';

export async function createEvent(req, res, next) {
  try {
    const event = await Event.create(req.body);
    return res.status(201).json({ success: true, event });
  } catch (err) {
    next(err);
  }
}

export async function getSessions(req, res, next) {
  try {
    const sessions = await Event.aggregate([
      {
        $group: {
          _id: '$session_id',
          total_events: { $sum: 1 },
          first_seen: { $min: '$timestamp' },
          last_seen: { $max: '$timestamp' }
        }
      },
      {
        $sort: { last_seen: -1 }
      },
      {
        $project: {
          _id: 0,
          session_id: '$_id',
          total_events: 1,
          first_seen: 1,
          last_seen: 1
        }
      }
    ]);
    return res.status(200).json(sessions);
  } catch (err) {
    next(err);
  }
}

export async function getSessionEvents(req, res, next) {
  try {
    const { sessionId } = req.params;
    const events = await Event.find({ session_id: sessionId })
      .sort({ timestamp: 1 })
      .select('session_id event_type page_url timestamp click_x click_y -_id')
      .lean();

    return res.status(200).json({ session_id: sessionId, events });
  } catch (err) {
    next(err);
  }
}

export async function getHeatmapPages(req, res, next) {
  try {
    const pages = await Event.distinct('page_url', { event_type: 'click' });
    return res.status(200).json({ pages });
  } catch (err) {
    next(err);
  }
}

export async function getHeatmapClicks(req, res, next) {
  try {
    const { pageUrl } = req.query;
    if (!pageUrl) {
      return res.status(400).json({ error: 'pageUrl query parameter is required' });
    }

    const decodedPageUrl = decodeURIComponent(pageUrl);
    const clicks = await Event.find({
      event_type: 'click',
      page_url: decodedPageUrl
    })
      .select('click_x click_y timestamp session_id -_id')
      .lean();

    return res.status(200).json({ pageUrl: decodedPageUrl, clicks });
  } catch (err) {
    next(err);
  }
}
