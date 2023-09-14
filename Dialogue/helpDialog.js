const { ComponentDialog, WaterfallDialog } = require("botbuilder-dialogs");
const { helpDialog } = require("../Component/DialogId");
const { CardFactory } = require("botbuilder");

const helpDialogWF1 = "helpDialogWF1";

class HelpDialog extends ComponentDialog {
  constructor(conversationState) {
    super(helpDialog);
    if (!conversationState) throw Error("ConversationalState Not Found");
    this.conversationState = conversationState;

    this.addDialog(
      new WaterfallDialog(helpDialogWF1, [this.sendHelpSuggestion.bind(this)])
    );

    this.initialDialogId = helpDialogWF1;
  }

  async sendHelpSuggestion(stepContext) {
    await stepContext.context.sendActivity(
      "How could I help You? Here are some of Options"
    );
    await stepContext.context.sendActivity({
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
    return await stepContext.endDialog();
  }
}

module.exports.HelpDialog = HelpDialog;
