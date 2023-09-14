const { ActivityHandler, CardFactory } = require("botbuilder");

class Bot extends ActivityHandler {
  constructor(conversationState, rootDialog) {
    super();
    if (!conversationState) throw Error("ConversationalState Not Found");
    this.conversationState = conversationState;
    this.rootDialog = rootDialog;
    this.accessor = this.conversationState.createProperty("DialogAccessor");
    this.onMessage(async (context, next) => {
      await this.rootDialog.run(context, this.accessor);
      await next();
    });

    this.onConversationUpdate(async (context, next) => {
      console.log(context.activity);
      if (
        context.activity.membersAdded &&
        context.activity.membersAdded[1].id == context.activity.from.id
      ) {
        await context.sendActivity({
          attachments: [
            CardFactory.adaptiveCard({
              type: "AdaptiveCard",
              $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
              version: "1.0",
              body: [
                {
                  type: "Container",
                  items: [
                    {
                      type: "Image",
                      url: "https://i.pinimg.com/originals/50/38/f6/5038f6672f089f3a50c4f075feddfc42.gif",
                    },
                    {
                      type: "TextBlock",
                      text: "Hii, My Name is Ginni.\nHow Can I help You?",
                      wrap: true,
                    },
                  ],
                },
              ],
            }),
          ],
        });
        await context.sendActivity({
          attachments: [
            CardFactory.heroCard(
              "Here are some options",
              null,
              CardFactory.actions([
                {
                  type: "imBack",
                  title: "Apply Leave",
                  value: "Apply Leave",
                },
                {
                  type: "postBack",
                  title: "Leave Status",
                  value: "Leave Status",
                },
                {
                  type: "imBack",
                  title: "help",
                  value: "help",
                },
              ])
            ),
          ],
        });
      }
      await next();
    });
  }
  async run(context) {
    await super.run(context);
    await this.conversationState.saveChanges(context, false);
  }
}

module.exports.Bot = Bot;
