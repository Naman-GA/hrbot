const {
  ComponentDialog,
  WaterfallDialog,
  ChoicePrompt,
  ChoiceFactory,
  NumberPrompt,
  TextPrompt,
  Dialog,
} = require("botbuilder-dialogs");
const { applyLeaveDialog, helpDialog } = require("../Component/DialogId");
const { CardFactory } = require("botbuilder");
const { confirmleave, leaveapplicationform } = require("../Cards/cards");
// const { HelpDialog } = require("./index");
const applyleaveDialogWF1 = "applyleaveDialogWF1";
const applyleaveDialogwithFormWF1 = "applyleaveDialogwithFormWF1";
const ChoicePromptDialog = "ChoicePromptDialog";
const NumberPromptDialog = "NumberPromptDialog";
const TextPromptDialog = "TextPromptDialog";

class ApplyLeaveDialog extends ComponentDialog {
  constructor(conversationState) {
    super(applyLeaveDialog);
    if (!conversationState) throw Error("Conversational State Not Found");
    this.conversationState = conversationState;
    this.applyLeaveStateAccessor =
      this.conversationState.createProperty("ApplyLeaveState");

    this.addDialog(new ChoicePrompt(ChoicePromptDialog));
    this.addDialog(new NumberPrompt(NumberPromptDialog));
    this.addDialog(new TextPrompt(TextPromptDialog));
    // this.addDialog(new HelpDialog(conversationState));
    this.addDialog(
      new WaterfallDialog(applyleaveDialogWF1, [
        this.askleaveType.bind(this),
        this.askNoOfDays.bind(this),
        this.askleavedate.bind(this),
        this.applyApplication.bind(this),
      ])
    );

    this.addDialog(
      new WaterfallDialog(applyleaveDialogwithFormWF1, [
        // this.preprocessentities.bind(this),
        this.showform.bind(this),
        this.preprocessUserInput.bind(this),
        this.applyApplication.bind(this),
      ])
    );

    // this.initialDialogId = applyleaveDialogwithFormWF1;
    this.initialDialogId = applyleaveDialogWF1;
  }
  //-----------preprocess clu entities-----------------------------------------------
  // async preprocessentities(stepContext) {
  //   try {
  //     if (stepContext.options && stepContext.options.luisresult) {
  //       console.log(stepContext.options.entites);
  //       for (entity in entites){
  //         let numberEntity = stepContext.options.entites[0];
  //       }
  //       return stepContext.next();
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
  //-----------------------------------------Through Adaptive Card------------------------
  async showform(stepContext) {
    try {
      if (stepContext.options && stepContext.options.formReFill) {
        console.log("inside form");
        return stepContext.next();
      } else {
        await stepContext.context.sendActivity({
          attachments: [CardFactory.adaptiveCard(leaveapplicationform())],
        });
        return Dialog.EndOfTurn;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async preprocessUserInput(stepContext) {
    try {
      if (
        stepContext.context.activity.value.actionType == "cancelLeaveAction"
      ) {
        await stepContext.beginDialog(helpDialog);
        return stepContext.endDialog();
      } else {
        let userInput;
        let dialogData = await this.applyLeaveStateAccessor.get(
          stepContext.context,
          {}
        );
        if (stepContext.options && stepContext.options.formReFill) {
          userInput = stepContext.options.values;
        } else {
          userInput = stepContext.context.activity.value;
        }
        dialogData.leaveType = userInput.leaveType;
        dialogData.leavedays = userInput.noDays;
        dialogData.leavedate = userInput.leaveDate;
        console.log(dialogData);
        if (parseInt(dialogData.leavedays) > 3) {
          await stepContext.context.sendActivity(
            "Only 3 Days Consecutive leave can be applied.Please Update the Days to upto 3 Days!"
          );
          return stepContext.endDialog();
        } else {
          await stepContext.context.sendActivity(
            "Thank You for Updating I am procedding your application!"
          );
          return stepContext.next();
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  //--------------------------------------------------------------------------------------
  async askleaveType(stepContext) {
    return await stepContext.prompt(ChoicePromptDialog, {
      prompt: "Please Help me with the type of Leave you want to apply for?",
      choices: ChoiceFactory.toChoices([
        "Sick Leave",
        "Casual Leave",
        "Earned Leave",
      ]),
    });
  }

  async askNoOfDays(stepContext) {
    let dialogData = await this.applyLeaveStateAccessor.get(
      stepContext.context,
      {}
    );
    dialogData.leaveType = stepContext.result.value;
    return await stepContext.prompt(
      NumberPromptDialog,
      `For how many days you want to apply ${dialogData.leaveType}?`
    );
  }

  async askleavedate(stepContext) {
    let dialogData = await this.applyLeaveStateAccessor.get(
      stepContext.context
    );
    dialogData.leavedays = stepContext.result;
    return await stepContext.prompt(
      TextPromptDialog,
      `For what date I should apply ${dialogData.leaveType}?`
    );
  }

  async applyApplication(stepContext) {
    let dialogData = await this.applyLeaveStateAccessor.get(
      stepContext.context
    );
    if (stepContext.result && !dialogData.leavedate) {
      dialogData.leavedate = stepContext.result;
    }
    await stepContext.context.sendActivity({
      attachments: [
        CardFactory.adaptiveCard(
          confirmleave(
            dialogData.leaveType,
            dialogData.leavedays,
            dialogData.leavedate
          )
        ),
      ],
    });
    return stepContext.endDialog();
  }
}

module.exports.ApplyLeaveDialog = ApplyLeaveDialog;
