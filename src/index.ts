import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import { handleMessage } from "./services/openaiService";
import { ensureUser } from "./services/userService";
import { clearHistory } from "./services/historyService";
import { exec } from "child_process";
import { promisify } from "util";

dotenv.config();
const execAsync = promisify(exec);

const bot = new Telegraf(process.env.BOT_TOKEN!);

bot.start(async (ctx) => {
	await ensureUser(ctx.from.id, ctx.from.username);
	await ctx.reply(
		'Добро пожаловать! Напишите что-нибудь или нажмите "Очистить диалог".',
		{
			reply_markup: {
				keyboard: [["🗑 Очистить диалог"]],
				resize_keyboard: true,
			},
		},
	);
});

bot.hears("🗑 Очистить диалог", async (ctx) => {
	await clearHistory(ctx.from.id);
	await ctx.reply("История очищена. Начнём с чистого листа.");
});

bot.on("text", async (ctx) => {
	const reply = await handleMessage(ctx.from.id, ctx.message.text);
	await ctx.reply(reply);
});

async function main() {
	try {
		console.log("📦 Applying migrations...");
		await execAsync("npx prisma migrate deploy");
		console.log("✅ Migrations applied");

		await bot.launch();
		console.log("🤖 Бот запущен");

		process.once("SIGINT", () => bot.stop("SIGINT"));
		process.once("SIGTERM", () => bot.stop("SIGTERM"));
	} catch (err) {
		console.error("❌ Ошибка при запуске:", err);
		process.exit(1);
	}
}

main();
