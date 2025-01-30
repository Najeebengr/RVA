import { neon } from "@neondatabase/serverless";
import { v4 as uuidv4 } from 'uuid';

// export async function POST(request: Request) {
//   try {
//     const sql = neon(process.env.DATABASE_URL!);
//     const body = await request.json();
//     const requestId = uuidv4();

//     const response = await sql`
//       INSERT INTO ride_requests (
//         id,
//         user_id,
//         driver_id,
//         status,
//         service_id,
//         ride_details,
//         user_location
//       ) VALUES (
//         ${requestId},
//         ${body.userId},
//         ${body.driverId},
//         'pending',
//         ${body.serviceId},
//         ${JSON.stringify(body.rideDetails)},
//         ${JSON.stringify(body.userLocation)}
//       )
//       RETURNING *
//     `;

//     return Response.json(response[0]);
//   } catch (error) {
//     console.error("Error creating ride request:", error);
//     return Response.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

export async function PUT(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const body = await request.json();

    const response = await sql`
      UPDATE ride_requests
      SET status = ${body.status}
      WHERE id = ${body.requestId}
      RETURNING *
    `;

    return Response.json(response[0]);
  } catch (error) {
    console.error("Error updating ride request:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 