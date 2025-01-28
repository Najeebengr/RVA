import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { name, serviceId, userId } = await request.json();

    if (!name || !serviceId || !userId) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const response = await sql`
      INSERT INTO drivers (
        first_name,
        last_name,
        service_id,
        user_id
      ) 
      VALUES (
        ${name},
        ${name},
        ${serviceId},
        ${userId}
      )
      RETURNING id;
    `;

    return Response.json({ data: response[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating driver:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
