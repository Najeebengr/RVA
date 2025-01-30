import { neon } from "@neondatabase/serverless";

export async function GET(request: Request, { id }: { id: string }) {
  // console.log(params.id , "params.id");
  if (!id)
    return Response.json({ error: "Missing required fields" }, { status: 400 });

  try {
    const sql = neon(process.env.DATABASE_URL!);

    const response = await sql`
      SELECT * FROM ride_requests 
      WHERE id = ${id}
    `;

    if (response.length === 0) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }

    return Response.json(response[0]);
  } catch (error) {
    console.error("Error fetching request:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { id }: { id: string }) {
  if (!id)
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { status } = await request.json();
    console.log(status , "status");
    console.log(id , "params");
    const response = await sql`
      UPDATE ride_requests 
      SET status = ${status}
      WHERE id = ${id}
      RETURNING *
    `;

    return Response.json(response[0]);
  } catch (error) {
    console.error("Error updating request:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 