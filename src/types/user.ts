export interface UserData {
    Access: string;
    Koodi: string;
    Admin?: string;
    Name?: string;
    Password?: string; 
    Username?: string;
    "Nyt soi"?: string;
    last_used?: string | null;
    lastLogin?: Date;
  }