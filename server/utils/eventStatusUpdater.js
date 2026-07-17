import Event from "../models/event.model.js";

const parseTime = (timeStr) => {
  if (!timeStr) return { hours: 23, minutes: 59 };
  const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!match) return { hours: 23, minutes: 59 };
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return { hours, minutes };
};

export const updateCompletedEvents = async () => {
  try {
    const now = new Date();
    // Fetch all events that are not draft, cancelled, or completed
    const events = await Event.find({
      isDeleted: { $ne: true },
      eventStatus: { $nin: ["completed", "cancelled", "draft"] }
    });

    const completedEventIds = [];

    for (const event of events) {
      if (event.schedule && event.schedule.date) {
        const d = new Date(event.schedule.date);
        const year = d.getFullYear();
        const month = d.getMonth();
        const date = d.getDate();
        const { hours, minutes } = parseTime(event.schedule.endTime);
        const endDateTime = new Date(year, month, date, hours, minutes, 0, 0);

        if (now > endDateTime) {
          completedEventIds.push(event._id);
        }
      }
    }

    if (completedEventIds.length > 0) {
      await Event.updateMany(
        { _id: { $in: completedEventIds } },
        { $set: { eventStatus: "completed" } }
      );
      console.log(`Updated ${completedEventIds.length} events to completed status.`);
    }
  } catch (error) {
    console.error("Error updating completed events:", error);
  }
};
