import { UUID } from "crypto";


export type Ticket = {
    ticket_id: string;
    ticket_code : string;
    tcat_id : string;
    torder_id : string;
}

export function createTicket(ticket_id: string, ticket_code: string, tcategory_id: string, torder_id: string): Ticket {
    return {
        ticket_id,
        ticket_code,
        tcategory_id,
        torder_id
    }
}

export function fromJson(json: string): Ticket {
    const obj = JSON.parse(json);
    return createTicket(obj.ticket_id, obj.ticket_code, obj.tcategory_id, obj.torder_id);
}

export function toJson(ticket: Ticket): string {
    return JSON.stringify(ticket);
}