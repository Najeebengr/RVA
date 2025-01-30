import { neon } from "@neondatabase/serverless";
import { v4 as uuidv4 } from 'uuid';
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // console.log(body , "body");
    const { userId, serviceId, rideDetails, driverId, userLocation } = body;
    const requestId = uuidv4();
    // Ensure serviceId is stored as string
    const normalizedServiceId = serviceId.toString();

    const sql = neon(process.env.DATABASE_URL!);
    const result = await sql`
      INSERT INTO ride_requests (
        id,
        user_id,
        service_id,
        ride_details,
        user_location,
        driver_id,
        status
      ) VALUES (
        ${requestId},
        ${userId},
        ${normalizedServiceId},
        ${JSON.stringify(rideDetails)},
        ${JSON.stringify(userLocation)},
        ${driverId},
        'pending'
      )
      RETURNING *
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error('Error creating request:', error);
    return Response.json({ error: "Failed to create request" }, { status: 500 });
  }
} 