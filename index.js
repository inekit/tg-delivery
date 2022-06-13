const { Telegraf, session } = require("telegraf");
const { readFileSync } = require("fs");
const stages = require("./stages");
const shortcuts = require("telegraf-steps-engine/shortcuts/shortcuts");
const middlewares = require("telegraf-steps-engine/middlewares/middlewares");
require('dotenv').config()
//const LocalSession = require('telegraf-session-local')

const allowed_updates = ["message", "callback_query", "chat_member"];
const TOKEN =
    process.env.BOT_TOKEN;

const bot = new Telegraf(TOKEN);

(async() => {


    Object.assign(bot.context, shortcuts, middlewares);

    const ctx = {...bot.context, telegram: bot.telegram };

    bot.use(session(),
        /*(new LocalSession({ 
           database: 'PublicStorage/sessions.json',
           storage: LocalSession.storageFileAsync,
           
         })).middleware(),*/
        stages);

    if ("process.env.NODE_ENV" === "production") {
        bot.catch(console.error);

        await bot.startWebhook(
            `/${TOKEN}`, {
                key: readFileSync(".Certs/PRIVATE.key"),
                cert: readFileSync(".Certs/PUBLIC.pem"),
            },
            8443
        );

        await bot.telegram.setWebhook(
           `https://${process.env.SERVER_IP}:8443/${TOKEN}`,
           {
             certificate: { source: ".Certs/PUBLIC.pem" },
             ip_address: process.env.SERVER_IP,
             allowed_updates,
             drop_pending_updates: true,
           }
         );
    } else {
        await bot.launch({
            allowedUpdates: allowed_updates,
            dropPendingUpdates: true,
        });
    }
})();


process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));