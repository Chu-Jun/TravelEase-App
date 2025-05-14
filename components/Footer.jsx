'use client'

import { faFacebookF, faInstagram } from "@fortawesome/free-brands-svg-icons"
import { faEnvelope } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Image from "next/image"
import Link from "next/link"

function Footer () {
  return (
    <footer>
        <div className="p-8 bg-primary text-white">
            <div className="mx-auto">
                <div className="flex mt-4 gap-x-4 lg:justify-center">
                    <Link href="https://www.facebook.com/share/19VQCeNsBx/?mibextid=wwXIfr" target="_blank"><FontAwesomeIcon icon={faFacebookF} size="2xl"/></Link>
                    <Link href="https://www.instagram.com/travelease.2025?igsh=MWkzbzI1bHNnbnVoeQ%3D%3D&utm_source=qr" target="_blank"><FontAwesomeIcon icon={faInstagram} size="2xl"/></Link>
                    <Link href="mailto:travelease.reminder@gmail.com" target="_blank"><FontAwesomeIcon icon={faEnvelope} size="2xl"/></Link>
                </div>
            </div>
            <div className="mx-auto text-center text-sm text-white mt-8">
                <p>© TravelEase 2025 Disclaimer: All Contents, Intellectual Properties & Copyright Reserved to TravelEase</p>
            </div>
        </div>
    </footer>
  )
}

export default Footer