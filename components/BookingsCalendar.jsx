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
      backColor: "#6aa84f" // Green for activities
    })) || [];

    // Convert flightBooking into event format
    const flightEvents = flightBooking?.map(flight => ({
      id: flight.flightbookingid,
      text: `Flight: ${flight.flightcode} (${flight.airline})`,
      start: `${flight.flightdate}T${flight.departtime}`,
      end: `${flight.flightdate}T${flight.departtime}`,
      backColor: "#cc4125" // Red for flights
    })) || [];

    // const accommEvents = accommodationBooking?.map(accommodation => ({
    //   id: accommodation.accommodationbookingid,
    //   text: `Accommodation: ${accommodation.location?.locationname}`,
    //   start: `${accommodation.checkindate}`,
    //   end: `${accommodation.checkoutdate}`,
    //   backColor: "#cc4125" // Red for flights
    // })) || [];

    // Combine both event types
    setEvents([...activityEvents, ...flightEvents]);
    // setEvents([...activityEvents, ...flightEvents, ...accommEvents]);
  }, [activityBooking, flightBooking]);

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
