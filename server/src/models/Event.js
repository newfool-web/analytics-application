import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    session_id: {
      type: String,
      required: true
    },
    event_type: {
      type: String,
      required: true,
      enum: ['page_view', 'click']
    },
    page_url: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      required: true
    },
    click_x: {
      type: Number,
      default: null
    },
    click_y: {
      type: Number,
      default: null
    }
  },
  {
    versionKey: false,
    timestamps: false,
    collection: 'events'
  }
);

eventSchema.index({ session_id: 1, timestamp: 1 });
eventSchema.index({ event_type: 1, page_url: 1 });
eventSchema.index({ session_id: 1 });

export const Event = mongoose.model('Event', eventSchema);
export default Event;
