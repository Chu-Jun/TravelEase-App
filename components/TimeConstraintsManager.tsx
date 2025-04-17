import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faClock } from "@fortawesome/free-solid-svg-icons";

interface Location {
  name: string;
}

interface TimeConstraint {
  location_name: string;
  required_arrival_time: string;
}

interface TimeConstraintsManagerProps {
  dayLabel: string;
  locations: Location[];
  timeConstraints?: TimeConstraint[];
  startTime: string;
  visitDuration: number;
  onTimeConstraintsChange: (constraints: TimeConstraint[]) => void;
  onStartTimeChange: (value: string) => void;
  onVisitDurationChange: (value: number) => void;
}

const TimeConstraintsManager: React.FC<TimeConstraintsManagerProps> = ({
  dayLabel,
  locations,
  timeConstraints = [],
  startTime,
  visitDuration,
  onTimeConstraintsChange,
  onStartTimeChange,
  onVisitDurationChange
}) => {
  const [showTimeSettings, setShowTimeSettings] = useState<boolean>(false);

  const formatDateForInput = (dateString: string | number | Date): string => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().slice(0, 16);
  };

  const addConstraint = () => {
    if (locations.length === 0) {
      alert("Please add locations first");
      return;
    }

    const newConstraint: TimeConstraint = {
      location_name: locations[0].name,
      required_arrival_time: "12:00"
    };

    onTimeConstraintsChange([...timeConstraints, newConstraint]);
  };

  const removeConstraint = (index: number) => {
    const newConstraints = [...timeConstraints];
    newConstraints.splice(index, 1);
    onTimeConstraintsChange(newConstraints);
  };

  const updateConstraint = (
    index: number,
    field: keyof TimeConstraint,
    value: string
  ) => {
    const newConstraints = [...timeConstraints];
    newConstraints[index] = {
      ...newConstraints[index],
      [field]: value
    };
    onTimeConstraintsChange(newConstraints);
  };

  return (
    <div className="mb-4 border rounded-lg p-3 bg-gray-50">
      <div className="flex justify-between items-center mb-2">
        <button
          className="text-blue-600 text-sm flex items-center"
          onClick={() => setShowTimeSettings(!showTimeSettings)}
        >
          <FontAwesomeIcon icon={faClock} className="mr-1" />
          {showTimeSettings ? "Hide Time Settings" : "Show Time Settings"}
        </button>
      </div>

      {showTimeSettings && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-sm font-medium w-32">Start Time:</label>
            <input
              type="datetime-local"
              className="border rounded p-1 flex-grow"
              value={formatDateForInput(startTime)}
              onChange={(e) => onStartTimeChange(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-sm font-medium w-32">Visit Duration:</label>
            <div className="flex items-center">
              <input
                type="number"
                className="border rounded p-1 w-20"
                value={visitDuration}
                min="10"
                max="480"
                onChange={(e) => onVisitDurationChange(Number(e.target.value))}
              />
              <span className="ml-2 text-sm text-gray-600">minutes</span>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex justify-between items-center mb-2">
              <h5 className="font-medium text-sm">Time Constraints:</h5>
              <button
                className="text-blue-600 text-sm flex items-center"
                onClick={addConstraint}
              >
                <FontAwesomeIcon icon={faPlus} className="mr-1" />
                Add Constraint
              </button>
            </div>

            {timeConstraints.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                No time constraints set
              </p>
            ) : (
              <div className="space-y-2">
                {timeConstraints.map((constraint, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 border-b pb-2"
                  >
                    <select
                      className="border rounded p-1 flex-grow"
                      value={constraint.location_name}
                      onChange={(e) =>
                        updateConstraint(index, "location_name", e.target.value)
                      }
                    >
                      {locations.map((loc, i) => (
                        <option key={i} value={loc.name}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        className="border rounded p-1"
                        value={constraint.required_arrival_time}
                        onChange={(e) =>
                          updateConstraint(
                            index,
                            "required_arrival_time",
                            e.target.value
                          )
                        }
                      />
                      <button
                        className="text-red-500"
                        onClick={() => removeConstraint(index)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeConstraintsManager;
