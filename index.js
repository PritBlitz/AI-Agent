import Groq from "groq-sdk";
import readline from "readline-sync";

const API_KEY = process.env.API_KEY;

const client = new Groq({
  apiKey: API_KEY,
});

function getWeatherDetails(city = "") {
  if (city.toLowerCase() === "ranchi") return "13°C";
  if (city.toLowerCase() === "mumbai") return "20°C";
  if (city.toLowerCase() === "kolkata") return "15°C";
  if (city.toLowerCase() === "delhi") return "5°C";
  if (city.toLowerCase() === "bhubaneswar") return "30°C";
  return "No data available"; // Default message for unsupported cities
}

const tools = {
  getWeatherDetails: getWeatherDetails,
};

const SYSTEM_PROMPT = `
You are an AI assistant that follows a structured JSON-based interaction process. You must adhere to the following states:

- **START**: Begin with the user's query.
- **PLAN**: Plan your actions using available tools.
- **ACTION**: Execute the action by calling a tool with appropriate inputs.
- **OBSERVATION**: Record observations from the action's output.
- **OUTPUT**: Generate a final response based on observations.

### Available Tools:
- **getWeatherDetails(city: string): string**  
  A function that returns the current weather of the specified city.

### Rule 1 :
1. Always respond in JSON format. No additional text is allowed.
2. Example of valid JSON response:
   {
     "type": "plan",
     "plan": "I will call getWeatherDetails for Ranchi."
   }
3. Handle each step in sequence: PLAN → ACTION → OBSERVATION → OUTPUT.

### Rule 2 :
1. Always respond in JSON format. No additional text is allowed.

2. If you encounter a situation where in where in  you need to find a sum of weather of two cities, you can use the following code:
Example of valid JSON response:
   {
     "type": "plan",
     "plan": "I will call getWeatherDetails for Ranchi."
   }
     {
     "type": "plan",
     "plan": "I will call getWeatherDetails for Mumbai."
   }
    Now my output will be the sum of the weather of the two cities. : 
    const output = {
            type: "output",
            output: "I will sum the weather of Ranchi and Mumbai."
          };

3. Handle each step in sequence: PLAN → ACTION → OBSERVATION → OUTPUT.

`;

const messages = [{ role: "system", content: SYSTEM_PROMPT }];

async function run() {
  while (true) {
    const query = readline.question(">> ");
    const q = {
      type: "user",
      user: query,
    };
    messages.push({ role: "user", content: JSON.stringify(q) });

    try {
      const chat = await client.chat.completions.create({
        model: "mixtral-8x7b-32768",
        messages: messages,
        response_format: { type: "json_object" },
      });
      const result = chat.choices[0].message.content;
      messages.push({ role: "assistant", content: result });

      const call = JSON.parse(result);

      if (call.type === "plan") {
        const plan = call.plan;

        if (plan.includes("getWeatherDetails")) {
          const city = plan.match(/for (\w+)/)[1]; // Extract city name
          const weather = getWeatherDetails(city);

          const output = {
            type: "output",
            output: `🤖 : The weather of ${city} is ${weather}.`,
          };
          messages.push({ role: "developer", content: JSON.stringify(output) });
          console.log(output.output);

          messages.length = 1; // Reset messages after output
        }
      }
    } catch (error) {
      console.error("Error while processing response:", error);
      break;
    }
  }
}

run();
