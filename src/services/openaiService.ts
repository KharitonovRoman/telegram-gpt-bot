import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { getRecentMessages, saveMessage } from "./historyService";
import { getUserModel } from "./userService";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function handleMessage(
	userId: number,
	userMessage: string,
): Promise<string> {
	const historyRaw = await getRecentMessages(userId);

	// Приводим каждое сообщение к корректному типу:
	const history: ChatCompletionMessageParam[] = historyRaw.map((m) => ({
		role: m.role as "user" | "assistant" | "system",
		content: m.content,
	}));

	const messages: ChatCompletionMessageParam[] = [
		...history,
		{ role: "user", content: userMessage },
	];

	const model = await getUserModel(userId);

	const completion = await openai.chat.completions.create({
		model,
		messages,
	});

	const reply =
		completion.choices[0].message.content || "Ошибка при генерации ответа";

	await saveMessage(userId, "user", userMessage);
	await saveMessage(userId, "assistant", reply);

	return reply;
}
