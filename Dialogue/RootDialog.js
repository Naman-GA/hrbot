const {
  ComponentDialog,
  DialogSet,
  DialogTurnStatus,
  WaterfallDialog,
} = require("botbuilder-dialogs");

const {
  rootDialog,
  helpDialog,
  applyLeaveDialog,
} = require("../Component/DialogId");
const { AzureKeyCredential } = require("@azure/core-auth");
const { ApplyLeaveDialog, HelpDialog } = require("./index");

const parseMessage = "parseMessage";
const {
  ConversationAnalysisClient,
} = require("@azure/ai-language-conversations");

const cluEndpoint = "https://hrbt-luis.cognitiveservices.azure.com/";
const client = new ConversationAnalysisClient(
  cluEndpoint,
  new AzureKeyCredential("a45c8e0e57494b86a247698756d1b311")
);

class RootDialog extends ComponentDialog {
  constructor(conversationState) {
    super(rootDialog);
    if (!conversationState) throw Error("ConversationalState Not Found");
    this.conversationState = conversationState;
    this.addDialog(
      new WaterfallDialog(parseMessage, [this.routeMessage.bind(this)])
    );

    this.addDialog(new HelpDialog(conversationState));
    this.addDialog(new ApplyLeaveDialog(conversationState));
    this.initialDialogId = parseMessage;
  }

  async run(context, accessor) {
    try {
      const dialogSet = new DialogSet(accessor);
      dialogSet.add(this);
      const dialogContext = await dialogSet.createContext(context);
      const results = await dialogContext.continueDialog();
      if (results && results.status === DialogTurnStatus.empty) {
        await dialogContext.beginDialog(this.id);
      } else {
        console.log("Dialog Stack is Empty");
      }
    } catch (error) {
      console.log(error);
    }
  }

  async routeMessage(stepContext) {
    //-------------for CLU Integration------------------------
    const task = {
      kind: "Conversation",
      analysisInput: {
        conversationItem: {
          id: stepContext.context.activity.conversation.id,
          participantId: stepContext.context.activity.from.id,
          text: stepContext.context.activity.text,
        },
      },
      parameters: {
        projectName: "testapp",
        deploymentName: "hrbyotdeplo",
      },
    };
    //--------end of block for clu query---------------------------
    if (
      stepContext.context.activity.value &&
      stepContext.context.activity.value.actionType
    ) {
      switch (stepContext.context.activity.value.actionType) {
        case "applyLeaveAction":
          let formvalues = stepContext.context.activity.value;
          delete stepContext.context.activity.value;
          return await stepContext.beginDialog(applyLeaveDialog, {
            formReFill: true,
            values: formvalues,
          });
      }
    } else {
      // const { result } = await client.analyzeConversation(task);
      // console.log("top intent: ", result.prediction.topIntent);
      // switch (result.prediction.topIntent) {
      //   case "applyleave":
      //     return await stepContext.beginDialog(applyLeaveDialog, {
      //       luisresult: true,
      //       entites: result.prediction.entities,
      //     });
      //   case "leave status":
      //     break;
      //   case "help":
      //     return await stepContext.beginDialog(helpDialog);
      //   case "cancelLeaveAction":
      //     return await stepContext.beginDialog(helpDialog);
      //   default:
      //     await context.sendActivity("Currently Learning");
      // }

      //---------without clu--------------------------------------------------------------------
      switch (stepContext.context.activity.text.toLowerCase()) {
        case "apply leave":
          return await stepContext.beginDialog(applyLeaveDialog);
        case "leave status":
          break;
        case "help":
          return await stepContext.beginDialog(helpDialog);
        case "cancelLeaveAction":
          return await stepContext.beginDialog(helpDialog);
        default:
          await stepContext.context.sendActivity("Currently Learning");
      }
      //----------------------------------------------------------------------------------------------------
    }
    return await stepContext.endDialog();
  }
}

module.exports.RootDialog = RootDialog;
