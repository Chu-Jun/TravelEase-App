"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache"

  interface SignUpFormValues {
    username: string;
    email: string;
    password: string;
  }

  interface FormValues {
    email: string;
    password: string;
  }

  export const signUpAction = async (formData: SignUpFormValues, role: string) => {
    const email = formData.email as string;
    const password = formData.password as string;
    const username = formData.username as string;
    const supabase = await createClient();
    const origin = (await headers()).get("origin");
  
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          role: role,
          username: username, // Ensure this is stored in raw_user_meta_data
        },
      },
    });
  
    if (error) {
      return {
        status: "error",
        message: error.message,
      };
    }
  
    if (data.user && data.user.identities?.length === 0) {
      return {
        status: "error",
        message: "User already exists",
      };
    }
  
    return {
      status: "success",
      message: "Thanks for signing up! Please check your email for a verification link.",
    };
  };
  

export const signInAction = async (formData: FormValues) => {
  const email = formData.email as string;
  const password = formData.password as string;
  const supabase = await createClient();

  const { data: user, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      status: "error",
      message: "Wrong Email/Password",
    };
  }

  return redirect("/profile");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/");
};

export const userUpdateProfileAction = async (formData: any) => {

  const supabase = await createClient();

  const id = formData.id as string;
  const username = formData.username as string;
  const email = formData.email as string;

  const { data, error } = await supabase
    .from("users")
    .upsert({
      id,
      username,
      email,
    });

  if (error) {
    return {
      status: "error",
      message: "Could not update profile",
    };
  } else {
    return {
      status: "success",
      message: "Profile updated",
    };
  }

}

export const createTripAction = async (formData: any) => {

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id;
  const tripName = formData.tripName as string;
  const tripStartDate = formData.tripStartDate as string;
  const tripEndDate = formData.tripEndDate as string;
  const tag = formData.tag as string;
  const touristNum = parseInt(formData.touristNum, 10);

  const { data, error } = await supabase
    .from("trip")
    .insert({
      userid: userId,
      tripname: tripName,
      tripstartdate: tripStartDate,
      tripenddate: tripEndDate,
      tag: tag,
      touristnum: touristNum,
    });

  if (error) {
    return {
      status: "error",
      message: error.message + "Could not create trip",
    };
  } else {
    return {
      status: "success",
      message: "Trip Created",
    };
  }
}

export const getTrips = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("trip").select("*");

  if (error) {
    console.error("Error fetching trips: ", error);
    return [];
  }

  return data;
};

export const editTripAction = async (formData: any) => {

  const supabase = await createClient();

  console.log(formData);

  // const {
  //   data: { user },
  // } = await supabase.auth.getUser();

  const tripName = formData.tripName as string;
  const tripStartDate = formData.tripStartDate as string;
  const tripEndDate = formData.tripEndDate as string;
  const tag = formData.tag as string;
  const touristNum = parseInt(formData.touristNum, 10);

  const { data, error } = await supabase
    .from("trip")
    .update({
      tripname: tripName,
      tripstartdate: tripStartDate,
      tripenddate: tripEndDate,
      tag: tag,
      touristnum: touristNum,
    }).eq("tripid", formData.id);

  if (error) {
    return {
      status: "error",
      message: "Could not update trip",
    };
  } else {
    return {
      status: "success",
      message: "Trip Updated",
    };
  }

}

export async function deleteTripAction(tripid: any) {
  try {
      const supabase = await createClient()

      // Delete related records first (assuming there's a workshop_registrations table)
      const { error: deletionError } = await supabase
          .from("trip")
          .delete()
          .eq("tripid", tripid)

      if (deletionError) {
          console.error("Error deleting selected trip:", deletionError)
          return {
              status: "error",
              message: "Failed to delete selected trip."
          }
      }

      return {
          status: "success",
          message: "Trip deleted successfully"
      }
  } catch (error) {
      console.error("Delete trip error:", error)
      return {
          status: "error",
          message: "An unexpected error occurred"
      }
  }
}
