const express = require("express");
const ngrok = require("ngrok");
const {
  BotFrameworkAdapter,
  ConversationState,
  MemoryStorage,
} = require("botbuilder");
const { Bot } = require("./botActivityHandler");
const { RootDialog } = require("./Dialogue/RootDialog");
const app = express();
app.use(express.json());

const adapter = new BotFrameworkAdapter({
  appId: "27537a50-1ea5-4244-8c4e-b04926c870b0",
  appPassword: "vHm8Q~CUetkMFXjl3.dtTvplMJsbyIcZhg-7mcmZ",
});
// id : 27537a50-1ea5-4244-8c4e-b04926c870b0
// password: vHm8Q~CUetkMFXjl3.dtTvplMJsbyIcZhg-7mcmZ
const memory = new MemoryStorage();
let conversationState = new ConversationState(memory);

const rootDialog = new RootDialog(conversationState);
const mainBot = new Bot(conversationState, rootDialog);

const startNgrok = async () => {
  try {
    const url = await ngrok.connect(3000);
    console.log(url);
    return url;
  } catch (error) {
    console.log(error);
  }
};

const stopNgrok = async () => {
  try {
    await ngrok.disconnect();
    console.log("Disconnected");
  } catch (error) {
    console.log(error);
  }
};

app.use("/api/messages", (req, res) => {
  adapter.processActivity(req, res, async (context) => {
    await mainBot.run(context);
  });
});

(async () => {
  const ngrokUrl = await startNgrok();
  if (ngrokUrl) {
    app.listen(3000, () => {
      console.log("Server listening on port 3000");
    });
  }
})();
// app.listen(3000, () => {
//   console.log("Server listening on port 3000");
// });
