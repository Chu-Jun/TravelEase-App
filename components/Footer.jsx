'use client'

import { faFacebookF, faInstagram, faLinkedin } from "@fortawesome/free-brands-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Image from "next/image"
import Link from "next/link"

function Footer () {
  return (
    <footer>
        <div className="p-8 bg-primary text-white">
            <div className="mx-auto">
                <div className="flex mt-4 gap-x-4 lg:justify-center">
                    <Link href="https://www.facebook.com/TravelEase/" target="_blank"><FontAwesomeIcon icon={faFacebookF} size="2xl"/></Link>
                    <Link href="https://www.instagram.com/TravelEase/" target="_blank"><FontAwesomeIcon icon={faInstagram} size="2xl"/></Link>
                    <Link href="https://www.linkedin.com/company/TravelEase/" target="_blank"><FontAwesomeIcon icon={faLinkedin} size="2xl"/></Link>
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