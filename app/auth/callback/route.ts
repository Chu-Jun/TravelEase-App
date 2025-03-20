import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get("token");
  const code = requestUrl.searchParams.get("code") || token;
  const type = requestUrl.searchParams.get("type"); // Check if it's email change
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

  console.log("Auth Callback Triggered");
  console.log("Auth Code/Token Received:", code);
  console.log("Auth Type:", type);

  if (!code) {
    console.error("Missing verification code");
    return new NextResponse("Missing verification code", { status: 400 });
  }

  const supabase = await createClient();

  let user = null;

  if (type === "email_change") {
    console.log("Handling email change verification...");

    // Fetch the current user first (before verifying OTP)
    const { data: userSession, error: sessionError } = await supabase.auth.getUser();

    if (sessionError || !userSession?.user) {
      console.error("Failed to fetch user session:", sessionError);
      return new NextResponse("Failed to verify user session", { status: 400 });
    }

    user = userSession.user;
    console.log("User for email verification:", user);

    // Attempt to verify the OTP for email change
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      email: user.email || "", // Ensure email is available
      token: code,
      type: "email_change",
    });

    if (verifyError) {
      console.error("Failed to verify email change:", verifyError);
      return new NextResponse("Email verification failed", { status: 400 });
    }

    console.log("Email change verified:", verifyData);
  } else {
    console.log("Handling regular authentication flow...");

    // Exchange the code for a session (standard login)
    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      console.error("Failed to exchange code for session:", sessionError);
      return new NextResponse("Authentication failed", { status: 400 });
    }

    user = sessionData?.user;
    console.log("User authenticated:", user);
  }

  if (!user) {
    console.error("User authentication failed");
    return new NextResponse("Authentication failed", { status: 400 });
  }

  // Check if the user needs to set a password
  const { data: tempPasswordRecord, error: tempPasswordError } = await supabase
    .from("temporary_passwords")
    .select("*")
    .eq("user_id", user.id)
    .single();

  console.log("Temporary Password Record:", tempPasswordRecord, "Error:", tempPasswordError);

  if (tempPasswordRecord) {
    console.log("Found pending password update - redirecting to set-password");
    return NextResponse.redirect(`${origin}/auth/set-password`);
  }

  // Redirect based on provided redirectTo URL
  if (redirectTo) {
    console.log("Redirecting to:", `${origin}${redirectTo}`);
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  console.log("Redirecting to default protected page:", `${origin}/protected`);
  return NextResponse.redirect(`${origin}/protected`);
}
