import React, { useEffect, useState } from 'react';
import { DayPilot, DayPilotCalendar, DayPilotNavigator } from "@daypilot/daypilot-lite-react";

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

  const addOneHour = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    const newHours = (hours + 1) % 24;
    return `${newHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
  };

  useEffect(() => {
    const activityEvents = activityBooking?.map(activity => ({
      id: activity.activitybookingid,
      text: `Activity: ${activity.activityname}`,
      start: `${activity.activitydate}T${activity.starttime}`,
      end: `${activity.activitydate}T${activity.endtime}`,
      backColor: "#56c4f8",
    })) || [];

    const flightEvents = flightBooking?.map(flight => {
      const departTime = flight.departtime || "00:00:00";
      const arrivalTime = flight.arrivaltime || addOneHour(departTime);

      return {
        id: flight.flightbookingid,
        text: `Flight: ${flight.flightcode} (${flight.airline})`,
        start: `${flight.flightdate}T${departTime}`,
        end: `${flight.flightdate}T${arrivalTime}`,
        backColor: "#FFB300",
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
          end: `${accommodation.checkindate}T${addMinutes(checkInTime, 60)}`,
          backColor: "#2dca33",
        },
        {
          id: `${accommodation.accommodationbookingid}-checkout`,
          text: `Check-out: ${accommodation.location?.locationname}`,
          start: `${accommodation.checkoutdate}T${checkOutTime}`,
          end: `${accommodation.checkoutdate}T${addMinutes(checkOutTime, 60)}`,
          backColor: "#2dca33",
        }
      ];
    }) || [];

    setEvents([...activityEvents, ...flightEvents, ...accommEvents]);
  }, [activityBooking, flightBooking, accommodationBooking]);

  return (
    <div className="flex flex-col md:flex-row mt-4 gap-4">
      {/* Navigator */}
      <div className="block md:hidden" style={{ minWidth: "220px", maxWidth: "100%" }}>
        <DayPilotNavigator
          selectMode={"Week"}
          showMonths={1}
          skipMonths={1}
          selectionDay={startDate}
          onTimeRangeSelected={args => setStartDate(args.day)}
        />
      </div>

      <div className="hidden md:block">
        <DayPilotNavigator
          selectMode={"Week"}
          showMonths={2}
          skipMonths={2}
          selectionDay={startDate}
          onTimeRangeSelected={args => setStartDate(args.day)}
        />
      </div>

      {/* Calendar */}
      <div className="flex-grow overflow-x-auto">
        <div className="min-w-[700px] sm:min-w-[800px] md:min-w-[1000px]">
          <DayPilotCalendar
            {...config}
            events={events}
            startDate={startDate}
            controlRef={setCalendar}
          />
        </div>
      </div>
    </div>
  );
};

export default BookingsCalendar;
