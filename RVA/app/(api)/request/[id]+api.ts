import { neon } from "@neondatabase/serverless";

export async function GET(request: Request, { id }: { id: string }) {
  if (!id)
    return Response.json({ error: "Missing required fields" }, { status: 400 });

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const response = await sql`
      SELECT * FROM ride_requests WHERE id = ${id}
    `;
    return Response.json(response[0]);
  } catch (error) {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 