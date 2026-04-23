import { UUID } from "crypto";


export type Ticket = {
    ticket_id: UUID;
    ticker_code : string;
    tcat_id : UUID;
    torder_id : UUID;
}