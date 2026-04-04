export type UserRole = "admin" | "user";

export interface User {
	uuid: string;
	name: string;
	email: string;
	role: UserRole;
	createdAt: string;
	updatedAt: string;
}
