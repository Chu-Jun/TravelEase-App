import React, { useEffect, useState } from 'react';
import { DayPilot, DayPilotCalendar, DayPilotNavigator } from "@daypilot/daypilot-lite-react";

const styles = {
  wrap: {
    display: "flex"
  },
  left: {
    marginRight: "10px"
  },
  main: {
    flexGrow: "1"
  }
};

const BookingsCalendar = ({ tripStartDate, activityBooking, flightBooking, accommodationBooking }) => {

  const [calendar, setCalendar] = useState(null);
  const [events, setEvents] = useState([]);
  const [startDate, setStartDate] = useState(tripStartDate);

  const config = {
    viewType: "Week",
    durationBarVisible: false,
    timeRangeSelectedHandling: "Enabled",
    onTimeRangeSelected: args => {
      calendar.clearSelection();
    },
  };

  useEffect(() => {
    // Convert activityBooking into event format
    const activityEvents = activityBooking?.map(activity => ({
      id: activity.activitybookingid,
      text: `Activity: ${activity.activityname}`,
      start: `${activity.activitydate}T${activity.starttime}`,
      end: `${activity.activitydate}T${activity.endtime}`,
      backColor: "#0097D1" // Blue for activities
    })) || [];

    // Convert flightBooking into event format
    const flightEvents = flightBooking?.map(flight => {
      // Default arrival time = depart time + 1 hour
      const departTime = flight.departtime || "00:00:00";
      const arrivalTime = flight.arrivaltime || addOneHour(departTime);
  
      return {
        id: flight.flightbookingid,
        text: `Flight: ${flight.flightcode} (${flight.airline})`,
        start: `${flight.flightdate}T${departTime}`,
        end: `${flight.flightdate}T${arrivalTime}`,
        backColor: "#e17100" // Yellow for flights
      };
    }) || [];

    const accommEvents = accommodationBooking?.map(accommodation => ({
      id: accommodation.accommodationbookingid,
      text: `Accommodation: ${accommodation.location?.locationname}`,
      start: `${accommodation.checkindate}T${accommodation.checkintime ?? "15:00:00"}`, // Default check-in at 3 PM
      end: `${accommodation.checkoutdate}T${accommodation.checkouttime ?? "12:00:00"}`, // Default check-out at 12 PM
      backColor: "#cc4125" // Red for accommodations
    })) || [];

    // Combine both event types
    // setEvents([...activityEvents, ...flightEvents]);
    setEvents([...activityEvents, ...flightEvents, ...accommEvents]);
  }, [activityBooking, flightBooking, accommodationBooking]);

  const addOneHour = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    const newHours = (hours + 1) % 24; // Ensure it stays within 24-hour format
    return `${newHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
  };

  return (
    <div style={styles.wrap} className='mt-4'>
      <div style={styles.left}>
        <DayPilotNavigator
          selectMode={"Week"}
          showMonths={2}
          skipMonths={2}
          selectionDay={startDate}
          onTimeRangeSelected={args => setStartDate(args.day)}
        />
      </div>
      <div style={styles.main}>
        <DayPilotCalendar
          {...config}
          events={events}
          startDate={startDate}
          controlRef={setCalendar}
        />
      </div>
    </div>
  );
};

export default BookingsCalendar;
