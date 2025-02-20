import Image from "next/image";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faClock } from "@fortawesome/free-solid-svg-icons";

const PlannedTripCard = ({ imageSrc, tripTitle, touristNum, duration, tag }) => {
  return (
    <Card className="bg-[#F5EFFF] shadow-md rounded-2xl p-4 flex items-center max-w-lg">
      {/* Image on the left */}
      <div className="flex-shrink-0 relative">
        <Image
          src={imageSrc}
          alt={tripTitle}
          width={80}
          height={80}
          className="rounded-lg object-cover border border-gray-200"
          priority
        />
        <span className="absolute top-1 left-1 bg-[#D7BFFF] text-white text-sm font-semibold px-2 py-1 rounded">
          {tag}
        </span>
      </div>

      {/* Content on the right */}
      <div className="ml-4 flex-1">
        <h3 className="text-xl font-semibold text-gray-800">{tripTitle}</h3>
        <div className="flex justify-start items-center gap-6 mt-2 text-gray-700 text-sm">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faUser} className="text-gray-500" />
            <span>{touristNum}</span>
          </div>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faClock} className="text-gray-500" />
            <span>{duration}</span>
          </div>
        </div>
      </div>

      {/* Button */}
      <button className="ml-4 text-gray-500 hover:text-gray-800">
        ...
      </button>
    </Card>
  );
};

export default PlannedTripCard;
