"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from 'uuid';
import { SupabaseClient } from "@supabase/supabase-js";

  interface SignUpFormValues {
    username: string;
    email: string;
    password: string;
  }

  interface FormValues {
    email: string;
    password: string;
  }

  interface Itinerary {
    [key: string]: string[]; 
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
    // Revalidate the itinerary page
    revalidatePath(`/itinerary-planning`);
    return {
      status: "success",
      message: "Trip Updated",
    };
  }

}

export const editTripBudgetAction = async (formData: any) => {

  const supabase = await createClient();

  const budget = formData.budget as string;

  const { data, error } = await supabase
    .from("trip")
    .update({
      budget: budget,
    }).eq("tripid", formData.id);

  if (error) {
    return {
      status: "error",
      message: "Could not update trip budget",
    };
  } else {
    // Revalidate the itinerary page
    revalidatePath(`/expense-tracking`);
    return {
      status: "success",
      message: "Trip Budget Updated",
    };
  }

}

export async function deleteTripAction(tripid: any) {
  try {
      const supabase = await createClient()

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

export async function getTripById(tripId: any) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("trip")
      .select("*")
      .eq("tripid", tripId)
      .single();
    
    if (error) {
      return {
        status: "error",
        message: "Could not retrieve selected trip",
      };
    } else {
      return {
        status: "success",
        message: "Trip retrieved",
        data: data,
      };
    }
    
  } catch (error) {
    console.error("Unexpected error in getTripById:", error);
    return null;
  }
}

/**
 * Get itinerary for a specific trip
 * @param {string} tripId - The trip ID
 * @returns {Promise<Object>} - Itinerary organized by days
 */
export async function getItinerary(tripId: any) {
  const supabase = await createClient();
  
  try {
    // First get trip details to determine day numbers
    const { data: tripData, error: tripError } = await supabase
      .from("trip")
      .select("tripstartdate")
      .eq("tripid", tripId)
      .single();
    
    if (tripError) {
      console.error("Error fetching trip for itinerary:", tripError);
      return {};
    }
    
    // Fetch itinerary data with joins
    const { data, error } = await supabase
      .from("itineraryperday")
      .select(`
        itineraryid,
        date,
        locationlist(
          locationlistid,
          location(locationid, locationname, locationcoordinate)
        )
      `)
      .eq("tripid", tripId)
      .order("date");
    
    if (error) {
      console.error("Error fetching itinerary:", error);
      return {};
    }
    
    // Organize by day
    const tripStartDate = new Date(tripData.tripstartdate);
    const itinerary: Itinerary = {};
    
    data.forEach(item => {
      // Calculate day number
      const currentDate = new Date(item.date);
      

      const diffTime = Math.abs(currentDate.getTime() - tripStartDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const dayLabel = `Day ${diffDays + 1}`;
      
      if (!itinerary[dayLabel]) {
        itinerary[dayLabel] = [];
      }
      console.log("Itinerary is " + JSON.stringify(item.locationlist, null, 2));
      // Add location name to the day's itinerary
      if ((item.locationlist as any)?.location?.locationname) {
        itinerary[dayLabel].push((item.locationlist as any).location.locationname);
      }
    });
    
    // Ensure all days have at least an empty array
    const tripEndDate = await getEndDate(tripId, supabase);
    if (tripEndDate) {
      const totalDays = getDaysBetween(tripData.tripstartdate, tripEndDate);
      for (let i = 1; i <= totalDays; i++) {
        const dayLabel = `Day ${i}`;
        if (!itinerary[dayLabel]) {
          itinerary[dayLabel] = [""];
        }
      }
    }
    
    return itinerary;
  } catch (error) {
    console.error("Unexpected error in getItinerary:", error);
    return {};
  }
}

/**
 * Helper to get trip end date
 */
async function getEndDate(tripId: any, supabase: SupabaseClient<any, "public", any>) {
  const { data } = await supabase
    .from("trip")
    .select("tripenddate")
    .eq("tripid", tripId)
    .single();
  
  return data?.tripenddate;
}

/**
 * Helper to calculate days between dates
 */
function getDaysBetween(startDate: string | number | Date, endDate: string | number | Date) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Create or update itinerary for a specific day
 * @param {string} tripId - The trip ID
 * @param {string} dayLabel - Day label (e.g., "Day 1")
 * @param {Array<string>} places - Array of place names
 * @returns {Promise<Object>} - Updated itinerary or error message
 */
export async function saveItineraryDay(tripId: any, dayLabel: string, places: any) {
  const supabase = await createClient();
  
  try {
    // Step 1: Get trip details
    const { data: tripData, error: tripError } = await supabase
      .from("trip")
      .select("tripstartdate")
      .eq("tripid", tripId)
      .single();
    
    if (tripError) {
      throw new Error('Trip not found');
    }
    
    // Step 2: Calculate the date for this day
    const dayNumber = parseInt(dayLabel.replace('Day ', ''), 10);
    const tripStartDate = new Date(tripData.tripstartdate);
    const dayDate = new Date(tripStartDate);
    dayDate.setDate(tripStartDate.getDate() + (dayNumber - 1));
    const formattedDate = dayDate.toISOString().split('T')[0];
    
    // Step 3: Find existing entries for this day to delete
    const { data: existingEntries, error: findError } = await supabase
      .from("itineraryperday")
      .select("itineraryid")
      .eq("tripid", tripId)
      .eq("date", formattedDate);
    
    // Step 4: Delete existing entries
    if (existingEntries && existingEntries.length > 0) {
      const { error: deleteError } = await supabase
        .from("itineraryperday")
        .delete()
        .eq("tripid", tripId)
        .eq("date", formattedDate);
      
      if (deleteError) {
        throw new Error('Unable to delete existing entries');
      }
    }
    
    // Step 5: Process each place
    for (const place of places) {
      if (!place.trim()) continue; // Skip empty places
      
      // Step 5a: Check if location exists
      const { data: existingLocation, error: locError } = await supabase
        .from("location")
        .select("locationid")
        .eq("locationname", place.trim())
        .limit(1);
      
      let locationId;
      
      // Step 5b: Create location if it doesn't exist
      if (locError || !existingLocation || existingLocation.length === 0) {
        const newLocationId = uuidv4();
        const { data: newLocation, error: createError } = await supabase
          .from("location")
          .insert({
            locationid: newLocationId,
            locationname: place.trim(),
            locationcoordinate: '0,0' // Default coordinates
          })
          .select();
        
        if (createError) {
          throw new Error('Unable to create new location' + createError.message);
        }
        
        locationId = newLocationId;
      } else {
        locationId = existingLocation[0].locationid;
      }
      
      // Step 5c: Create location list entry
      const locationListId = uuidv4();
      const { error: listError } = await supabase
        .from("locationlist")
        .insert({
          locationlistid: locationListId,
          locationid: locationId
        });
      
      if (listError) {
        throw new Error('Unable to create new location list');
      }
      
      // Step 5d: Create itinerary entry
      const { error: itinError } = await supabase
        .from("itineraryperday")
        .insert({
          itineraryid: uuidv4(),
          tripid: tripId,
          locationlistid: locationListId,
          date: formattedDate
        });
      
      if (itinError) {
        throw new Error('Unable to create new itinerary');
      }
    }
    
    // Step 6: Revalidate the itinerary page
    revalidatePath(`/itinerary-planning/${tripId}`);
    
    // Step 7: Return updated itinerary
    return await getItinerary(tripId);
  } catch (error) {
    console.error("Error saving itinerary day:", error);
    
    // Type guard approach
    if (error instanceof Error) {
        return { error: "Failed to save itinerary: " + error.message };
    }
    
    // For non-standard errors
    return { error: "Failed to save itinerary: " + String(error) };
}
}

/**
 * Delete an entire day's itinerary
 * @param {string} tripId - The trip ID
 * @param {string} dayLabel - Day label (e.g., "Day 1")
 * @returns {Promise<Object>} - Success status or error
 */
export async function deleteItineraryDay(tripId: any, dayLabel: string) {
  const supabase = await createClient();
  
  try {
    // Get trip details
    const { data: tripData, error: tripError } = await supabase
      .from("trip")
      .select("tripstartdate")
      .eq("tripid", tripId)
      .single();
    
    if (tripError) {
      throw new Error('Trip not found');
    }
    
    // Calculate the date for this day
    const dayNumber = parseInt(dayLabel.replace('Day ', ''), 10);
    const tripStartDate = new Date(tripData.tripstartdate);
    const dayDate = new Date(tripStartDate);
    dayDate.setDate(tripStartDate.getDate() + (dayNumber - 1));
    const formattedDate = dayDate.toISOString().split('T')[0];
    
    // Delete existing entries
    const { error: deleteError } = await supabase
      .from("itineraryperday")
      .delete()
      .eq("tripid", tripId)
      .eq("date", formattedDate);
    
    if (deleteError) {
      throw deleteError;
    }
    
    // Revalidate the itinerary page
    revalidatePath(`/itinerary-planning/${tripId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting itinerary day:", error);
    
    // Type guard approach
    if (error instanceof Error) {
        return { error: "Failed to delete itinerary: " + error.message };
    }
    
    // For non-standard errors
    return { error: "Failed to delete itinerary: " + String(error) };
}
}

/**
 * Reorder locations within a day's itinerary
 * @param {string} tripId - The trip ID
 * @param {string} dayLabel - Day label (e.g., "Day 1")
 * @param {Array<string>} orderedPlaces - Array of place names in new order
 * @returns {Promise<Object>} - Updated itinerary or error
 */
export async function reorderItinerary(tripId: any, dayLabel: any, orderedPlaces: any) {
  try {
    // Delete first, then recreate in the new order
    const deleteResult = await deleteItineraryDay(tripId, dayLabel);
    
    if (deleteResult.error) {
      return deleteResult;
    }
    
    return await saveItineraryDay(tripId, dayLabel, orderedPlaces);
  } catch (error) {
    console.error("Error reordering itinerary day:", error);
    
    // Type guard approach
    if (error instanceof Error) {
        return { error: "Failed to reorder itinerary: " + error.message };
    }
    
    // For non-standard errors
    return { error: "Failed to reorder itinerary: " + String(error) };
}
}

export const createExpenseAction = async (formData: any) => {

  const supabase = await createClient();

  console.log(formData);
  const tripid = formData.tripid as string;
  const date = formData.date as string;
  const amountspent = parseFloat(formData.amountspent);
  const category = formData.category as string;
  const remarks = formData.remarks as string;

  const { data, error } = await supabase
    .from("expenserecord")
    .insert({
      tripid: tripid,
      date: date,
      amountspent: amountspent,
      category: category,
      remarks: remarks,
    });

  if (error) {
    return {
      status: "error",
      message: error.message + "Could not create expense record",
    };
  } else {
    return {
      status: "success",
      message: "Expense Record Created",
    };
  }
}

export const getExpenses = async (tripId: any) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("expenserecord").select("*").eq("tripid", tripId).order("date", { ascending: false })

  if (error) {
    console.error("Error fetching expense records: ", error);
    return [];
  }

  return data;
};

export const editExpenseAction = async (formData: any) => {

  const supabase = await createClient();

  console.log(formData);

  const date = formData.date as string;
  const amountspent = parseFloat(formData.amountspent);
  const category = formData.category as string;
  const remarks = formData.remarks as string;

  const { data, error } = await supabase
    .from("expenserecord")
    .update({
      date: date,
      amountspent: amountspent,
      category: category,
      remarks: remarks,
    }).eq("expensesrecordid", formData.id);

  if (error) {
    console.log(error.message);
    return {
      status: "error",
      message: "Could not update expense record",
    };
  } else {
    // Revalidate the expense tracking page
    revalidatePath(`/expense-tracking`);
    return {
      status: "success",
      message: "Record Updated",
    };
  }

}

export async function deleteExpenseAction(expensesRecordId: any) {
  try {
      const supabase = await createClient()

      const { error: deletionError } = await supabase
          .from("expenserecord")
          .delete()
          .eq("expensesrecordid", expensesRecordId)

      if (deletionError) {
          console.error("Error deleting selected record:", deletionError, expensesRecordId)
          return {
              status: "error",
              message: "Failed to delete selected record."
          }
      }

      return {
          status: "success",
          message: "Record deleted successfully"
      }
  } catch (error) {
      console.error("Delete record error:", error)
      return {
          status: "error",
          message: "An unexpected error occurred"
      }
  }
}

export const createAccommodationBookingAction = async (formData: any) => {

  const supabase = await createClient();

  const tripid = formData.tripid as string;
  const accommodationname = formData.accommodationName as string;
  const checkindate = formData.checkInDate as string;
  const checkoutdate = formData.checkOutDate as string;
      
      // Check if location exists
      const { data: existingLocation, error: locError } = await supabase
        .from("location")
        .select("locationid")
        .eq("locationname", accommodationname.trim())
        .limit(1);
      
      let locationId;
      
      // Create location if it doesn't exist
      if (locError || !existingLocation || existingLocation.length === 0) {
        const newLocationId = uuidv4();
        const { data: newLocation, error: createError } = await supabase
          .from("location")
          .insert({
            locationid: newLocationId,
            locationname: accommodationname.trim(),
            locationcoordinate: '0,0' // Default coordinates
          })
          .select();
        
        if (createError) {
          throw new Error('Unable to create new location' + createError.message);
        }
        
        locationId = newLocationId;
      } else {
        locationId = existingLocation[0].locationid;
      }

  const { data, error } = await supabase
    .from("accommodationbooking")
    .insert({
      tripid: tripid,
      accommodationname: accommodationname,
      checkindate: checkindate,
      checkoutdate: checkoutdate,
      locationid: locationId,
    });

  if (error) {
    return {
      status: "error",
      message: error.message + "Could not create booking record",
    };
  } else {
    return {
      status: "success",
      message: "Accommodation Booking Record Created",
    };
  }
}

export const getAccommodationBookings = async (tripId: any) => {
  const supabase = await createClient();
  const { data, error } = 
  await supabase.from("accommodationbooking")
  .select(`
    *,
    location ( locationid, locationname )
  `)
                .eq("tripid", tripId)
                .order("checkindate", { ascending: true })

  if (error) {
    console.error("Error fetching accommodation booking records: ", error);
    return [];
  }

  return data;
};

export const createFlightBookingAction = async (formData: any) => {

  const supabase = await createClient();

  const tripid = formData.tripid as string;
  const flightdate = formData.flightDate as string;
  const flightcode = formData.flightCode as string;
  const airline = formData.airline as string;
  const departairport = formData.departAirport as string;
  const arriveairport = formData.arriveAirport as string;

  const { data, error } = await supabase
    .from("flightbooking")
    .insert({
      tripid: tripid,
      flightdate: flightdate,
      flightcode: flightcode,
      airline: airline,
      departairport: departairport,
      arriveairport: arriveairport,
    });

  if (error) {
    return {
      status: "error",
      message: error.message + "Could not create booking record",
    };
  } else {
    return {
      status: "success",
      message: "Flight Booking Record Created",
    };
  }
}

export const getFlightBookings = async (tripId: any) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("flightbooking").select("*").eq("tripid", tripId).order("flightdate", { ascending: true })

  if (error) {
    console.error("Error fetching flight booking records: ", error);
    return [];
  }

  return data;
};

export const createActivityBookingAction = async (formData: any) => {

  const supabase = await createClient();

  console.log(formData);
  const tripid = formData.tripid as string;
  const activityname = formData.activityName as string;
  const activitydate = formData.activityDate as string;
  const starttime = formData.activityStartTime as string;
  const endtime = formData.activityEndTime as string;
  const activitylocationname = formData.activityLocationName as string;

  // Check if location exists
  const { data: existingLocation, error: locError } = await supabase
  .from("location")
  .select("locationid")
  .eq("locationname", activitylocationname.trim())
  .limit(1);

let locationId;

// Create location if it doesn't exist
if (locError || !existingLocation || existingLocation.length === 0) {
  const newLocationId = uuidv4();
  const { data: newLocation, error: createError } = await supabase
    .from("location")
    .insert({
      locationid: newLocationId,
      locationname: activitylocationname.trim(),
      locationcoordinate: '0,0' // Default coordinates
    })
    .select();
  
  if (createError) {
    throw new Error('Unable to create new location' + createError.message);
  }
  
  locationId = newLocationId;
} else {
  locationId = existingLocation[0].locationid;
}

  const { data, error } = await supabase
    .from("activitybooking")
    .insert({
      tripid: tripid,
      activityname: activityname,
      activitydate: activitydate,
      starttime: starttime,
      endtime: endtime,
      locationid: locationId,
    });

  if (error) {
    return {
      status: "error",
      message: error.message + "Could not create booking record",
    };
  } else {
    return {
      status: "success",
      message: "Activity Booking Record Created",
    };
  }
}

export const getActivityBookings = async (tripId: any) => {
  const supabase = await createClient();
  const { data, error } = 
  await supabase.from("activitybooking")
  .select(`
    *,
    location ( locationid, locationname )
  `)
  .eq("tripid", tripId)
  .order("activitydate", { ascending: true })

  if (error) {
    console.error("Error fetching activity booking records: ", error);
    return [];
  }

  return data;
};

