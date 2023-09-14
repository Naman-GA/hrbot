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
const { result } = await client.analyzeConversation(task);
console.log("query: ", result.query);
console.log("project kind: ", result.prediction.projectKind);
console.log("top intent: ", result.prediction.topIntent);

const prediction = result.prediction;
if (prediction.projectKind == "Conversation") {
  console.log("category: ", prediction.intents[0].category);
  console.log("confidence score: ", prediction.intents[0].confidence);
  console.log("entities:");

  for (const entity of prediction.entities) {
    console.log("\ncategory: ", entity.category);
    console.log("text: ", entity.text);
    console.log("confidence score: ", entity.confidence);

    if (entity.resolutions) {
      console.log("resolutions:");
      for (const resolution of entity.resolutions) {
        console.log("kind: ", resolution.resolutionKind);
        if ("value" in resolution) console.log("value: ", resolution.value);
      }
    }

    if (entity.extraInformation) {
      console.log("extra info:");
      for (const data of entity.extraInformation) {
        console.log("kind: ", data.extraInformationKind);
        if (data.extraInformationKind == "ListKey")
          console.log("key: ", data.key);
        if (data.extraInformationKind == "EntitySubtype")
          console.log("value: ", data.value);
      }
    }
  }
}
