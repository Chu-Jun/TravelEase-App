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

  const addMinutes = (time, minutesToAdd) => {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date(0, 0, 0, hours, minutes + minutesToAdd);
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}:00`;
  };

  useEffect(() => {
    // Convert activityBooking into event format
    const activityEvents = activityBooking?.map(activity => ({
      id: activity.activitybookingid,
      text: `Activity: ${activity.activityname}`,
      start: `${activity.activitydate}T${activity.starttime}`,
      end: `${activity.activitydate}T${activity.endtime}`,
      backColor: "#56c4f8", // Blue for activities
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
        backColor: "#FFB300", // Yellow for flights
      };
    }) || [];

    const accommEvents = accommodationBooking?.flatMap(accommodation => {
      const checkInTime = accommodation.checkintime ?? "15:00:00";
      const checkOutTime = accommodation.checkouttime ?? "12:00:00";
    
      return [
        {
          id: `${accommodation.accommodationbookingid}-checkin`,
          text: `Check-in: ${accommodation.location?.locationname}`,
          start: `${accommodation.checkindate}T${checkInTime}`,
          end: `${accommodation.checkindate}T${addMinutes(checkInTime, 60)}`, // show as 30-min event
          backColor: "#2dca33",
        },
        {
          id: `${accommodation.accommodationbookingid}-checkout`,
          text: `Check-out: ${accommodation.location?.locationname}`,
          start: `${accommodation.checkoutdate}T${checkOutTime}`,
          end: `${accommodation.checkoutdate}T${addMinutes(checkOutTime, 60)}`, // show as 30-min event
          backColor: "#2dca33",
        }
      ];
    }) || [];    

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
