import Image from "next/image";

import { Card, CardHeader, CardContent } from "@/components/ui/card";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapPin } from "@fortawesome/free-solid-svg-icons";

const MustVisitCard = ({ imageSrc, locationName, country }) => {
  return (
        <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
        <CardHeader>
            <Image
            src={imageSrc}
            alt={locationName}
            width={1500}
            height={1500}
            className="w-full h-56 object-cover"
            priority
            />
        </CardHeader>
        <CardContent>
            <h3 className="text-lg font-bold text-gray-800 leading-tight mb-4">{locationName}</h3>
            <div className="flex flex-col gap-y-2 text-black font-semibold">
                <div className="flex gap-x-6 items-center">
                    <FontAwesomeIcon icon={faMapPin} className="w-[5%]"/>
                    <p className="text-gray-600 text-sm w-[95%] -ml-2">{country}</p>
                </div>
            </div>
        </CardContent>
        </Card>
  );
};

export default MustVisitCard;
