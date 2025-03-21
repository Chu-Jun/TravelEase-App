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

  interface TripData {
    tripstartdate: string;
  }
  
  interface LocationData {
    locationid: string;
    locationname: string;
    locationcoordinate: string;
    placeid: string | null;
    formattedaddress: string | null;
  }
  
  interface LocationListData {
    locationlistid: string;
    location: LocationData;
  }
  
  interface ItineraryItem {
    location: any;
    itinerary_location: any;
    itineraryid: string;
    date: string;
    locationlist: LocationListData;
  }
  
  interface Marker {
    name: string;
    coordinate: {
      lat: number;
      lng: number;
    };
    locationId: string;
    placeId: string | null;
    formattedAddress: string | null;
  }
  
  interface ItineraryData {
    places: Record<
      string,
      { name: string; placeId: string; coordinate: { lat: number; lng: number } }[]
    >;
    markers: Record<string, Marker[]>;
  }

  async function createAnonymousUser() {
    const supabase = await createClient();
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) throw error;
      
      return data.user;
    } catch (error) {
      console.error('Error creating anonymous user:', error);
      throw error;
    }
  }
  
  export const signUpAction = async (formData: SignUpFormValues, role: string) => {
    const email = formData.email as string;
    const password = formData.password as string;
    const username = formData.username as string;
    const supabase = await createClient();
    const origin = (await headers()).get("origin");
  
    // First, check if there's an anonymous session
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData?.session?.user;
    
    // If there's a current user and they're anonymous
    if (currentUser && !currentUser.email) {
      // First update the user metadata for username and role
      await supabase.auth.updateUser({
        data: {
          role: role,
          username: username,
        }
      });
      
      // Store a record in the temporary_passwords table
      // Use "pending" as the password status
      try {
        await supabase
          .from('temporary_passwords')
          .upsert({
            user_id: currentUser.id,
            password: "pending"  // Just indicating status, not storing actual password
          });
      } catch (dbError) {
        console.error("Failed to store password status:", dbError);
        return {
          status: "error",
          message: "Failed to prepare for password update",
        };
      }
      
      // Then update the email in a separate call
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        email: email
      });
  
      if (updateError) {
        return {
          status: "error",
          message: updateError.message,
        };
      }else{
        console.log(updateData);
      }

      await supabase
      .from("users")
      .update({
        username: username,
        email: email,
      }).eq("id", currentUser.id);

      await supabase
      .from("profiles")
      .update({
        role: "user"
      }).eq("id", currentUser.id);
  
      return {
        status: "success",
        message: "Please check your email for a verification link. After verifying, you'll need to set your password.",
      };
    } else {
      // This is a new user, proceed with normal sign up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
          data: {
            role: role,
            username: username,
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
    }
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
    console.log(user);
    console.log(error);
    return {
      status: "error",
      message: "Wrong Email/Password",
      
    };
  }else{
    return {
      status: "success",
      message: "Sign In Successful",
    };
  }
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

export const resetPasswordAction = async (formData: any) => {
  const supabase = await createClient();

  const password = formData.password as string;
  const confirmPassword = formData.confirmPassword as string;

  if (!password || !confirmPassword) {
    return {
      status: "error",
      redirect: "/protected/reset-password",
      message: "Password and confirm password are required",
    };
  }

  if (password !== confirmPassword) {
    return {
      status: "error",
      redirect: "/protected/reset-password",
      message: "Passwords do not match",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return {
      status: "error",
      redirect: "/protected/reset-password",
      message: "Password update failed",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error: deletePendingError } = await supabase
    .from("temporary_passwords")
    .delete()
    .eq("user_id", user?.id);

  return {
    status: "success",
    redirect: "/sign-in",
    message: "Password updated",
  };
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
  const reminderDays = formData.reminder_days as number;
  const emailPreferences = formData.email_preferences as { trip_reminders: boolean };

  const { data, error } = await supabase
    .from("users")
    .upsert({
      id,
      username,
      email,
      reminder_days: reminderDays,
      email_preferences: emailPreferences
    });

  if (error) {
    console.error("Error updating profile:", error, "Data is: ", data);
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
  let is_anonymous = true;
  let anonUserId = null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Create anonymous user if none exists
    await createAnonymousUser();
    // The user should now be authenticated
    
    // Re-fetch user to ensure we have the latest user data
    const { data: { user } } = await supabase.auth.getUser();
    anonUserId = user?.id;
  }else{
    is_anonymous = false;
  }

  const { data: trip, error: tripError } = await supabase
  .from('trip')
  .select('*')

  if(!user?.email && trip?.length != 0){
    return {
      status: "error",
      message: "Sign up to manage more than one trip",
    };
  }

  const userId = user?.id ? user?.id : anonUserId ;
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
      is_anonymous: is_anonymous,
    });

  if (error) {
    console.log(data);
    return {
      status: "error",
      message: error?.message + "Could not create trip",
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

export async function getTripDetails(tripId: any) {
  const supabase = await createClient();

  console.log("trip id received", tripId);
  // Fetch trip data
  const { data: trip, error: tripError } = await supabase
    .from('trip')
    .select('*')
    .eq('tripid', tripId)
    .single()
  
  if (tripError) {
    console.error("Error fetching trip:", tripError)
    return null
  }
  
  // Fetch accommodations for the trip
  const { data: accommodations, error: accomError } = await supabase
    .from('accommodationbooking')
    .select('*, location!inner(*)')
    .eq('tripid', tripId)
  
    if (accomError) {
      console.error("Error fetching accommpdations:", accomError)
      return null
    }
  
  // Fetch flights for the trip
  const { data: flights, error: flightError } = await supabase
    .from('flightbooking')
    .select('*')
    .eq('tripid', tripId)

  
    if (flightError) {
      console.error("Error fetching flights:", flightError)
      return null
    }
  // Fetch activities for the trip
  const { data: activities, error: activityError } = await supabase
    .from('activitybooking')
    .select('*, location!inner(*)')
    .eq('tripid', tripId)

    if (activityError) {
      console.error("Error fetching activities:", activityError)
      return null
    }
  
  // Fetch expenses for the trip
  const { data: expenses, error: expensesError } = await supabase
    .from('expenserecord')
    .select('*')
    .eq('tripid', tripId)

    if (expensesError) {
      console.error("Error fetching expenses:", expensesError)
      return null
    }
  
  // Fetch itinerary days for the trip
  const { data: itineraryDays, error: itineraryError } = await supabase
    .from('itineraryperday')
    .select('*')
    .eq('tripid', tripId)
    .order('date', { ascending: true })

    if (itineraryError) {
      console.error("Error fetching itinerary:", itineraryError)
      return null
    }
  
  // Calculate total expenses
  const totalExpenses = expenses?.reduce((sum: number, expense: { amountspent: string; }) => sum + parseFloat(expense.amountspent), 0) || 0
  console.log("Total Expenses is", totalExpenses);
  
  return {
    ...trip,
    accommodations: accommodations || [],
    flights: flights || [],
    activities: activities || [],
    expenses: totalExpenses,
    itineraryDays: itineraryDays || []
  }
}

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
    console.log(data);
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
    console.log(data);
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
 * @returns {Promise<ItineraryData>} - Itinerary organized by days
 */
export async function getItinerary(tripId: string): Promise<ItineraryData> {
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
      return { places: {}, markers: {} };
    }
    
    // Fetch itinerary data with joins, now using the itinerary_location table
    const { data, error } = await supabase
      .from("itineraryperday")
      .select(`
        itineraryid,
        date,
        itinerary_location(
          locationid
        ),
        location(
          locationid,
          locationname,
          locationcoordinate,
          placeid,
          formattedaddress
        )
      `)
      .eq("tripid", tripId)
      .order("date");
    
    if (error) {
      console.error("Error fetching itinerary:", error);
      return { places: {}, markers: {} };
    }

    console.log("Complete data structure:", JSON.stringify(data, null, 2));
    
    // Organize by day
    const tripStartDate = new Date((tripData as TripData).tripstartdate);
    const itinerary: Record<string, { name: string; placeId: string; coordinate: { lat: number; lng: number } }[]> = {};
    const markers: Record<string, Marker[]> = {};
    
    (data as unknown as ItineraryItem[]).forEach(item => {
      // Calculate day number
      const currentDate = new Date(item.date);
      const diffTime = Math.abs(currentDate.getTime() - tripStartDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const dayLabel = `Day ${diffDays + 1}`;
      
      if (!itinerary[dayLabel]) {
        itinerary[dayLabel] = [];
        markers[dayLabel] = [];
      }
      
      // Get location info from the itinerary_location table
      const locationDataArray = item.itinerary_location?.map((link: any) => link.locationid)
        .map((locationId: string) => item.location?.find((loc: { locationid: string; }) => loc.locationid === locationId));

      locationDataArray.forEach((locationData: { locationname: any; placeid: any; locationcoordinate: string; locationid: any; formattedaddress: any; }) => {
        if (locationData?.locationname) {
          // Ensure `itinerary[dayLabel]` is initialized as an array of objects
          if (!itinerary[dayLabel]) {
            itinerary[dayLabel] = [];
          }

          const placeObj = {
            name: locationData.locationname,
            placeId: locationData.placeid || "",
            coordinate: {
              lat: parseFloat(locationData.locationcoordinate?.split(',')[0]) || 0,
              lng: parseFloat(locationData.locationcoordinate?.split(',')[1]) || 0
            }
          };
        
          itinerary[dayLabel].push(placeObj);
          
          // Process coordinates
          if (locationData.locationcoordinate) {
            const [lat, lng] = locationData.locationcoordinate.split(',').map(Number);
            
            // Only add valid coordinates to markers
            if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
              markers[dayLabel].push({
                name: locationData.locationname,
                coordinate: { lat, lng },
                locationId: locationData.locationid,
                placeId: locationData.placeid,
                formattedAddress: locationData.formattedaddress
              });
            }
          }
        }
      });
    });
    
    // Ensure all days have at least an empty array
    const tripEndDate = await getEndDate(tripId, supabase);
    if (tripEndDate) {
      const totalDays = getDaysBetween((tripData as TripData).tripstartdate, tripEndDate);
      for (let i = 1; i <= totalDays; i++) {
        const dayLabel = `Day ${i}`;
        if (!itinerary[dayLabel]) {
          itinerary[dayLabel] = [];
          markers[dayLabel] = [];
        }
      }
    }

    console.log(itinerary); // Verify multiple locations per day
    
    // Return both the itinerary and markers
    return {
      places: itinerary,
      markers: markers
    };
  } catch (error) {
    console.error("Unexpected error in getItinerary:", error);
    return {
      places: {},
      markers: {}
    };
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
 * @param {Array<Object>} places - Array of place objects
 * @returns {Promise<Object>} - Updated itinerary or error message
 */
export async function saveItineraryDay(tripId: string, dayLabel: string, places: any) {
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

    if(findError){
      console.log("No itinerary data for this date");
    }
    
    // Step 4: Delete existing entries and their associations
    if (existingEntries && existingEntries.length > 0) {
      // First, delete the associations in the itinerary_location table
      for (const entry of existingEntries) {
        const { error: deleteAssocError } = await supabase
          .from("itinerary_location")
          .delete()
          .eq("itineraryperdayid", entry.itineraryid);
        
        if (deleteAssocError) {
          throw new Error('Unable to delete existing location associations');
        }
      }
      
      // Then delete the itineraryperday entries
      const { error: deleteError } = await supabase
        .from("itineraryperday")
        .delete()
        .eq("tripid", tripId)
        .eq("date", formattedDate);
      
      if (deleteError) {
        throw new Error('Unable to delete existing entries');
      }
    }
    
    // Step 5: Create ONE itinerary entry for this day
    const itineraryPerDayId = uuidv4();
    const { error: itinError } = await supabase
      .from("itineraryperday")
      .insert({
        itineraryid: itineraryPerDayId,
        tripid: tripId,
        date: formattedDate
      });
    
    if (itinError) {
      throw new Error('Unable to create new itinerary');
    }
    
    // Step 6: Process each place and associate with the same itinerary day
    for (const place of places) {
      if (!place || (typeof place === 'string' && !place.trim())) continue; // Skip empty places
      
      const placeName = typeof place === 'string' ? place.trim() : place.name.trim();
      const coordinates = typeof place === 'string'
        ? '0,0'
        : (
            place && 
            typeof place === 'object' && 
            place.coordinate && 
            typeof place.coordinate === 'object' && 
            typeof place.coordinate.lat === 'number' && 
            typeof place.coordinate.lng === 'number'
          ) 
            ? `${place.coordinate.lat},${place.coordinate.lng}`
            : '0,0';
      
      if (!placeName) continue; // Skip if no name
      
      // Step 6a: Check if location exists with the same name
      const { data: existingLocation, error: locError } = await supabase
        .from("location")
        .select("locationid")
        .eq("locationname", placeName)
        .limit(1);
      
      let locationId;
      
      // Step 6b: Create location if it doesn't exist
      if (locError || !existingLocation || existingLocation.length === 0) {
        const newLocationId = uuidv4();
        const { data: newLocation, error: createError } = await supabase
          .from("location")
          .insert({
            locationid: newLocationId,
            locationname: placeName,
            locationcoordinate: coordinates,
            placeid: typeof place === 'string' ? null : place.placeId || null,
            formattedaddress: typeof place === 'string' ? null : place.formattedAddress || null
          })
          .select();
        
        if (createError) {
          throw new Error('Unable to create new location: ' + newLocation + " Error:" + createError.message);
        }
        
        locationId = newLocationId;
      } else {
        // Update the existing location with new coordinates if we have them
        if (coordinates !== '0,0') {
          locationId = existingLocation[0].locationid;
          const { error: updateError } = await supabase
            .from("location")
            .update({
              locationcoordinate: coordinates,
              placeid: typeof place === 'string' ? null : place.placeId || null,
              formattedaddress: typeof place === 'string' ? null : place.formattedAddress || null
            })
            .eq("locationid", locationId);
            
          if (updateError) {
            console.error("Error updating location coordinates:", updateError);
          }
        } else {
          locationId = existingLocation[0].locationid;
        }
      }
      
      // Step 6c: Create entry in the itinerary_location table
      // Associate location with the SAME itinerary day ID for all places
      const { error: itinLocError } = await supabase
        .from("itinerary_location")
        .insert({
          itineraryperdayid: itineraryPerDayId,
          locationid: locationId
        });
      
      if (itinLocError) {
        throw new Error('Unable to associate location with itinerary');
      }
    }
    
    // Step 7: Revalidate the itinerary page
    revalidatePath(`/itinerary-planning/${tripId}`);
    
    // Step 8: Return updated itinerary
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
    console.log(data);
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
    console.log(data);
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
  const checkintime = formData.checkInTime ? formData.checkInTime : "15:00:00";
  const checkoutdate = formData.checkOutDate as string;
  const checkouttime = formData.checkOutTime ? formData.checkOutTime : "12:00:00";
      
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
          throw new Error('Unable to create new location for ' + newLocation + " Error: " + createError.message);
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
      checkintime: checkintime,
      checkoutdate: checkoutdate,
      checkouttime: checkouttime,
      locationid: locationId,
    });

  if (error) {
    console.log(data);
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

export const editAccommodationBookingAction = async (formData: any) => {

  const supabase = await createClient();

  const accommodationname = formData.accommodationName as string;
  const checkindate = formData.checkInDate as string;
  const checkintime = formData.checkInTime as string;
  const checkoutdate = formData.checkOutDate as string;
  const checkouttime = formData.checkOutTime as string;
      
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
          throw new Error('Unable to create new location for ' + newLocation + " Error: " + createError.message);
        }
        
        locationId = newLocationId;
      } else {
        locationId = existingLocation[0].locationid;
      }

  const { data, error } = await supabase
    .from("accommodationbooking")
    .update({
      accommodationname: accommodationname,
      checkindate: checkindate,
      checkintime: checkintime,
      checkoutdate: checkoutdate,
      checkouttime: checkouttime,
      locationid: locationId,
    }).eq("accbookingid", formData.id);

  if (error) {
    console.log(data);
    return {
      status: "error",
      message: error.message + "Could not update booking record",
    };
  } else {
    return {
      status: "success",
      message: "Accommodation Booking Record Updated",
    };
  }
}

export async function deleteAccommodationAction(accBookingId: any) {
  try {
      const supabase = await createClient()

      const { error: deletionError } = await supabase
          .from("accommodationbooking")
          .delete()
          .eq("accbookingid", accBookingId)

      if (deletionError) {
          console.error("Error deleting selected record:", deletionError, accBookingId)
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

export const createFlightBookingAction = async (formData: any) => {

  const supabase = await createClient();

  const tripid = formData.tripid as string;
  const flightdate = formData.flightDate as string;
  const flightcode = formData.flightCode as string;
  const airline = formData.airline as string;
  const departairport = formData.departAirport as string;
  const arriveairport = formData.arriveAirport as string;
  const departtime = formData.departTime as string;
  const arrivaltime = formData.arrivalTime as string;

  const { data, error } = await supabase
    .from("flightbooking")
    .insert({
      tripid: tripid,
      flightdate: flightdate,
      flightcode: flightcode,
      airline: airline,
      departairport: departairport,
      arriveairport: arriveairport,
      departtime: departtime,
      arrivaltime: arrivaltime,
    });

  if (error) {
    console.log(data);
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

export const editFlightBookingAction = async (formData: any) => {

  const supabase = await createClient();

  const flightdate = formData.flightDate as string;
  const flightcode = formData.flightCode as string;
  const airline = formData.airline as string;
  const departairport = formData.departAirport as string;
  const arriveairport = formData.arriveAirport as string;
  const departtime = formData.departTime as string;
  const arrivaltime = formData.arrivalTime as string;

  const { data, error } = await supabase
    .from("flightbooking")
    .update({
      flightdate: flightdate,
      flightcode: flightcode,
      airline: airline,
      departairport: departairport,
      arriveairport: arriveairport,
      departtime: departtime,
      arrivaltime: arrivaltime,
    }).eq("flightbookingid", formData.id);

  if (error) {
    console.log(data);
    return {
      status: "error",
      message: error.message + "Could not update booking record",
    };
  } else {
    return {
      status: "success",
      message: "Flight Booking Record Updated",
    };
  }
}

export async function deleteFlightAction(flightBookingId: any) {
  try {
      const supabase = await createClient()

      const { error: deletionError } = await supabase
          .from("flightbooking")
          .delete()
          .eq("flightbookingid", flightBookingId)

      if (deletionError) {
          console.error("Error deleting selected record:", deletionError, flightBookingId)
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
    throw new Error('Unable to create new location for ' + newLocation + " Error: " + createError.message);
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

export const editActivityBookingAction = async (formData: any) => {

  const supabase = await createClient();

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
    throw new Error('Unable to create new location for ' + newLocation + " Error: " + createError.message);
  }
  
  locationId = newLocationId;
} else {
  locationId = existingLocation[0].locationid;
}

  const { data, error } = await supabase
    .from("activitybooking")
    .update({
      activityname: activityname,
      activitydate: activitydate,
      starttime: starttime,
      endtime: endtime,
      locationid: locationId,
    }).eq("activitybookingid", formData.id);

  if (error) {
    console.log(data);
    return {
      status: "error",
      message: error.message + "Could not update booking record",
    };
  } else {
    return {
      status: "success",
      message: "Activity Booking Record Updated",
    };
  }
}

export async function deleteActivityAction(activityBookingId: any) {
  try {
      const supabase = await createClient()

      const { error: deletionError } = await supabase
          .from("activitybooking")
          .delete()
          .eq("activitybookingid", activityBookingId)

      if (deletionError) {
          console.error("Error deleting selected record:", deletionError, activityBookingId)
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