import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
export async function GET() {
  try {
    const result = await sql`
    SELECT hr.relationship_id, hr.seat_id, hr.ticket_id, s.section, s.seat_number, s.row_number
    FROM tiktaktuk.has_relationship hr
    JOIN tiktaktuk.seat s ON hr.seat_id = s.seat_id
    ORDER BY hr.relationship_id ASC;`;

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching has_relationship data:", error);
    return NextResponse.json({ error: "Failed to fetch has_relationship data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { seat_id, ticket_id } = body;  
        if (!seat_id || !ticket_id) {
            return NextResponse.json({ message: "Seat ID and Ticket ID are required." }, { status: 400 });
        }
        const result = await sql`
            INSERT INTO tiktaktuk.has_relationship (seat_id, ticket_id)
            VALUES (${seat_id}, ${ticket_id})
            RETURNING seat_id, ticket_id;`;
        return NextResponse.json(result[0]);

    } catch (error) {
        console.error("Error creating has_relationship:", error);
        return NextResponse.json({ message: "Failed to create has_relationship." }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const ticket = searchParams.get("ticket_id");
        if (!ticket) {
            return NextResponse.json({ message: "Ticket ID is required." }, { status: 400 });
        }
        await sql`
            DELETE FROM tiktaktuk.has_relationship
            WHERE ticket_id = ${ticket};`;
        return NextResponse.json({ message: "has_relationship deleted successfully." });
    } catch (error) {
        console.error("Error deleting has_relationship:", error);
        return NextResponse.json({ message: "Failed to delete has_relationship." }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { seat_id, ticket_id } = body;
        if (!seat_id || !ticket_id) {
            return NextResponse.json({ message: "Seat ID and Ticket ID are required." }, { status: 400 });
        }
        const result = await sql`
            UPDATE tiktaktuk.has_relationship
            SET seat_id = ${seat_id}
            WHERE ticket_id = ${ticket_id}
            RETURNING seat_id, ticket_id;`;
        if (result.length === 0) {
            return NextResponse.json({ message: "has_relationship not found." }, { status: 404 });
        }
        return NextResponse.json(result[0]);

    } catch (error) {
        console.error("Error updating has_relationship:", error);
        return NextResponse.json({ message: "Failed to update has_relationship." }, { status: 500 });
    }
}