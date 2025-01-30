import { neon } from "@neondatabase/serverless";

export async function GET(request: Request, { id }: { id: string }) {
  if (!id)
    return Response.json({ error: "Missing required fields" }, { status: 400 });

  try {
    console.log(id, "id");
    const sql = neon(process.env.DATABASE_URL!);

    const response = await sql`
      SELECT u.user_type, d.id as driver_id
      FROM users u
      LEFT JOIN drivers d ON u.clerk_id = d.user_id 
      WHERE u.clerk_id = ${id}
    `;
    console.log(response, "response");
    if (response.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ 
      user_type: response[0].user_type,
      driver_id: response[0].driver_id
    });
  } catch (error) {
    console.error("Error fetching user role:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 