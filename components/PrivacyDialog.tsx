"use client"

import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function PrivacyDialog() {

    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <span
                    className="text-blue-600 underline text-sm"
                >
                    Privacy Policy
                </span>
            </DialogTrigger>
                <DialogContent className="text-black w-4/5 rounded-lg overflow-y-scroll h-[80%]">
                    <DialogHeader>
                        <DialogTitle>
                            <p className="text-title font-extrabold">Privacy Policy</p>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 text-sm text-gray-700">
                    <p><strong>1. Collection of Personal Data</strong></p>
                    <p>We may collect the following personal data: name, email, phone number, travel preferences, login credentials (hashed), booking data, and device/IP information.</p>

                    <p><strong>2. Purpose of Data Collection</strong></p>
                    <ul className="list-disc pl-5">
                        <li>To manage your TravelEase account</li>
                        <li>To optimize your travel routes</li>
                        <li>To store and manage bookings</li>
                        <li>To send notifications and updates</li>
                        <li>To enhance platform security and performance</li>
                    </ul>

                    <p><strong>3. Disclosure of Data</strong></p>
                    <p>Your data may be shared with trusted third-party services for operations (e.g., payment, routing APIs) but will not be sold.</p>

                    <p><strong>4. Data Security</strong></p>
                    <p>We use encrypted data transmission, secure storage, and routine audits to protect your data.</p>

                    <p><strong>5. Retention Period</strong></p>
                    <p>We retain data as long as necessary for the purpose it was collected, or as required by law.</p>

                    <p><strong>6. Your Rights</strong></p>
                    <ul className="list-disc pl-5">
                        <li>Access your personal data</li>
                        <li>Correct inaccuracies</li>
                        <li>Withdraw consent</li>
                        <li>Request deletion (subject to legal exceptions)</li>
                    </ul>

                    <p><strong>7. Cookies</strong></p>
                    <p>We use cookies to personalize your experience. You may disable them via browser settings.</p>

                    <p><strong>8. Cross-Border Transfer</strong></p>
                    <p>Some data may be processed outside Malaysia. Adequate protection measures will be taken.</p>

                    <p><strong>9. Third-Party Links</strong></p>
                    <p>Our platform may contain links to third-party sites. We are not responsible for their privacy practices.</p>

                    <p><strong>10. Policy Updates</strong></p>
                    <p>We may revise this policy. Changes will be communicated via the platform or email.</p>

                    <p><strong>11. Contact Us</strong></p>
                    <p>Email: <a href="mailto:reminder@travelease.site" className="text-blue-500">reminder@travelease.site</a></p>
                    </div>
                </DialogContent>
        </Dialog>
    );
}
