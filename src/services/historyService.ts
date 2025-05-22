import { prisma } from "../db/client";

export async function getRecentMessages(userId: number) {
	const messages = await prisma.message.findMany({
		where: { userId },
		orderBy: { createdAt: "desc" },
		take: 10,
	});
	return messages.reverse().map(({ role, content }) => ({ role, content }));
}

export async function saveMessage(
	userId: number,
	role: string,
	content: string,
) {
	await prisma.message.create({ data: { userId, role, content } });
}

export async function clearHistory(userId: number) {
	await prisma.message.deleteMany({ where: { userId } });
}
