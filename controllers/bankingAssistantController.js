const openai = require("../services/openaiClient");
//const faqs = require("../public/financial_faqs.json").faqs;
const faqs = require("../public/mortgage_faqs.json").faqs;

exports.getUserContext = () => [
  {
    role: "system",
    content:
      "You are explicitly a helpful loan assistant officer. You must explicitly reply ONLY using provided FAQs. If explicitly requested to connect to an agent or human, respond explicitly with only the phrase 'TRANSFER_TO_AGENT' clearly.",
  },
  {
    role: "system",
    content: `Provided FAQs explicitly: ${JSON.stringify(faqs)}`,
  },
];

exports.queryAssistant = async (userContext, userInput) => {
  userContext.push({ role: "user", content: userInput });

  // Call explicitly OpenAI Chat Completions API
  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    messages: userContext,
    temperature: 0,
    max_tokens: 150,
  });

  // Explicitly use "let" (not const!) to reassign clearly and explicitly
  let reply = res.choices[0].message.content.trim();

  // Explicitly ideal robust agent-transfer handling
  if (
    reply.toUpperCase().includes("TRANSFER_TO_AGENT") ||
    reply.toLowerCase().includes("connect me to an agent") ||
    reply.toLowerCase().includes("human agent") ||
    reply.toLowerCase().includes("transfer to agent")
  ) {
    reply = "TRANSFER_TO_AGENT"; // explicit exact phrase assignment
  }

  userContext.push({ role: "assistant", content: reply });

  return reply;
};
