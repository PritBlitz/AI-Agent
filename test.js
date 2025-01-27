import Groq from "groq-sdk";

async function listModels() {
  const groq = new Groq({
    apiKey: "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",
  });
  const models = await groq.models.list();
  console.log(models);
}

listModels();
