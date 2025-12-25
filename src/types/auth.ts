export interface UserProfile {
    name: string;
    role: string;
    color: string;
    avatar: string;
    position?: string;
    pin?: string;
    username?: string; // Sometimes useful to have here
}
