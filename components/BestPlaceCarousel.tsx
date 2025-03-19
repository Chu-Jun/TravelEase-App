'use client'

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import { mustVisitList } from "@/data/mustvisit_list";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapPin } from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import Link from "next/link";
import Image from "next/image"

function BestPlaceCarousel () {

    const plugin = React.useRef(
        Autoplay({delay: 1500, stopOnInteraction: false})
    )

  return (

    <Carousel
      plugins={[plugin.current]}
      className="w-full"
      // onMouseEnter={plugin.current.stop}
      // onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {mustVisitList.map((item, index) => (
          <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/4 mb-8">
            <div className="p-0">
            <Link href={`https://www.google.com/search?q=${item.locationName}`} target="_blank">
                <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <CardHeader>
                        <Image
                        src={item.imageSrc}
                        alt={item.locationName}
                        width={1500}
                        height={1500}
                        className="w-full h-56 object-cover"
                        priority
                        />
                    </CardHeader>
                    <CardContent>
                        <h3 className="text-lg font-bold text-gray-800 leading-tight mb-4">{item.locationName}</h3>
                        <div className="flex flex-col gap-y-2 text-black font-semibold">
                            <div className="flex items-center justify-center gap-x-2">
                                <FontAwesomeIcon icon={faMapPin} className="w-4 h-3"/>
                                <p className="text-gray-600 text-sm">{item.country}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Link>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}

export default BestPlaceCarousel;