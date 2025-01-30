import { neon } from "@neondatabase/serverless";

export async function GET(request: Request, { id }: { id: string }) {
  if (!id)
    return Response.json({ error: "Missing required fields" }, { status: 400 });

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const driverId = id;

    const response = await sql`
      SELECT 
        id,
        user_id,
        status,
        service_id,
        ride_details,
        user_location,
        created_at
      FROM ride_requests
      WHERE driver_id = ${driverId}
      AND status = 'pending'
      ORDER BY created_at DESC
    `;
    console.log(driverId , "driverId");
    console.log(response , "response");
    // Ensure proper JSON formatting of the response
    const formattedResponse = response.map(req => ({
      id: req.id,
      user_id: req.user_id,
      status: req.status,
      service_id: req.service_id,
      ride_details: typeof req.ride_details === 'string' 
        ? JSON.parse(req.ride_details) 
        : req.ride_details,
      user_location: typeof req.user_location === 'string' 
        ? JSON.parse(req.user_location) 
        : req.user_location,
      created_at: req.created_at
    }));

    return new Response(JSON.stringify(formattedResponse), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error("Error fetching driver requests:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 