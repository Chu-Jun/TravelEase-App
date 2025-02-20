'use client'

import { faFacebookF, faInstagram, faLinkedin } from "@fortawesome/free-brands-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Image from "next/image"
import Link from "next/link"

function Footer () {
  return (
    <footer>
        <div className="p-10 bg-primary text-white">
            <div className="mx-auto">
                <div className="flex mt-8 gap-x-4 lg:justify-center">
                    <Link href="https://www.facebook.com/cs.usm.my/" target="_blank"><FontAwesomeIcon icon={faFacebookF} size="2xl"/></Link>
                    <Link href="https://www.instagram.com/cs.usm/" target="_blank"><FontAwesomeIcon icon={faInstagram} size="2xl"/></Link>
                    <Link href="https://www.linkedin.com/company/cssocietyusm/" target="_blank"><FontAwesomeIcon icon={faLinkedin} size="2xl"/></Link>
                </div>
            </div>
            <div className="mx-auto text-center text-sm text-white p-4 mt-4">
                <p>© TravelEase 2025 Disclaimer: All Contents, Intellectual Properties & Copyright Reserved to TravelEase</p>
            </div>
        </div>
    </footer>
  )
}

export default Footer