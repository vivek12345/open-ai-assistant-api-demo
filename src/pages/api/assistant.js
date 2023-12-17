import OpenAI from "openai";

const openai = new OpenAI(process.env.OPENAI_API_KEY);

const handler = async (req, res) => {
  const assistant = await openai.beta.assistants.create({
    name: "Math Tutor",
    model: "gpt-4-1106-preview",
    instructions:
      "You are a math tutor that will help the user with math homework.",
    tools: [{ type: "code_interpreter" }],
  });

  const thread = await openai.beta.threads.create();
  const message = await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: "I need to solve the equation `3x + 11 = 14`. Can you help me?",
  });
  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id,
  });

  await checkStatus(thread.id, run.id);
  const messages = await openai.beta.threads.messages.list(thread.id);
  console.log(messages);
  res.status(200).send({
    answer: messages.body.data[0].content[0].text.value,
  });
};

async function checkStatus(threadId, runId) {
  let isComplete = false;
  while (!isComplete) {
    const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
    if (runStatus.status === "completed") {
      isComplete = true;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

export default handler;
