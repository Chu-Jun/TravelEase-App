"use client"

import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function TermsDialog() {

    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <span
                    className="text-blue-600 underline text-sm"
                >
                    Terms & Conditions
                </span>
            </DialogTrigger>
                <DialogContent className="text-black w-4/5 rounded-lg overflow-y-scroll h-[80%]">
                    <DialogHeader>
                        <DialogTitle>
                            <p className="text-title font-extrabold">Terms & Conditions</p>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 text-sm text-gray-700">
                        <p><strong>1. Acceptance of Terms</strong></p>
                        <p>By creating an account or using any part of the TravelEase platform, you agree to be bound by these Terms & Conditions and our Privacy Policy.</p>

                        <p><strong>2. Eligibility</strong></p>
                        <p>You must be at least 18 years old to use TravelEase. By using the platform, you confirm that you meet this requirement.</p>

                        <p><strong>3. User Responsibilities</strong></p>
                        <ul className="list-disc pl-5">
                            <li>Provide accurate and current information.</li>
                            <li>Keep your login credentials secure.</li>
                            <li>Use the platform only for lawful purposes.</li>
                        </ul>

                        <p><strong>4. Booking & Payments</strong></p>
                        <p>TravelEase may link to third-party booking services. We are not responsible for those transactions or their terms.</p>

                        <p><strong>5. Intellectual Property</strong></p>
                        <p>All content on TravelEase, including the logo, design, and software, is the property of TravelEase or its licensors and is protected under intellectual property laws.</p>

                        <p><strong>6. Termination</strong></p>
                        <p>We reserve the right to suspend or terminate accounts that violate these terms or misuse our services.</p>

                        <p><strong>7. Limitation of Liability</strong></p>
                        <p>TravelEase is provided "as-is." We are not liable for any indirect or consequential damages arising from your use of the platform.</p>

                        <p><strong>8. Changes to Terms</strong></p>
                        <p>We may update these Terms & Conditions at any time. Continued use of TravelEase indicates acceptance of any changes.</p>

                        <p><strong>9. Contact Us</strong></p>
                        <p>If you have questions regarding these Terms & Conditions, please email us at <a href="reminder@travelease.site" className="text-blue-500">reminder@travelease.site</a>.</p>
                        </div>
                </DialogContent>
        </Dialog>
    );
}
