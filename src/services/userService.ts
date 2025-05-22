import { prisma } from "../db/client";

export async function ensureUser(id: number, username?: string) {
	const found = await prisma.user.findUnique({ where: { id } });
	if (!found) {
		await prisma.user.create({
			data: { id, username: username || "", model: "gpt-3.5-turbo" },
		});
	}
}

export async function getUserModel(userId: number): Promise<string> {
	const user = await prisma.user.findUnique({ where: { id: userId } });
	return user?.model || "gpt-3.5-turbo";
}
