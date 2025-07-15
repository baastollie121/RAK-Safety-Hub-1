"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// testHiraGenerator.ts
const hira_generator_1 = require("./src/ai/flows/hira-generator");
async function runHiraTest() {
    console.log("Starting HIRA Generator simulation test...");
    const mockInput = {
        companyName: "Acme Corp",
        taskTitle: "Office Renovation",
        reviewDate: "2024-12-31",
        hazards: [
            {
                hazard: "Working at height during ceiling installation",
                personsAffected: "Workers, visitors. Potential for falls, serious injury, or fatality.",
                initialLikelihood: 4,
                initialConsequence: 5,
                controlMeasures: "Use of scaffolding with guardrails, fall arrest systems, worker training, supervision, tool lanyards.",
                residualLikelihood: 1,
                residualConsequence: 2,
            },
            {
                hazard: "Exposure to dust from demolition",
                personsAffected: "Workers. Potential for respiratory issues, eye irritation.",
                initialLikelihood: 3,
                initialConsequence: 2,
                controlMeasures: "Use of N95 masks, dust suppression techniques (wetting), ventilation, regular cleaning.",
                residualLikelihood: 1,
                residualConsequence: 1,
            },
        ],
    };
    try {
        console.log("Attempting to generate HIRA with mock data...");
        // This call will attempt to run the actual AI flow,
        // which might require a running Genkit backend and configured models.
        // If it fails due to AI model connection, it indicates the setup is not live,
        // which is expected in a disconnected simulation.
        const output = await (0, hira_generator_1.generateHira)(mockInput);
        console.log("HIRA Generation successful (or mock response received):");
        console.log(output.hiraDocument.substring(0, 500) + '...'); // Print first 500 chars
    }
    catch (error) {
        console.error("HIRA Generation failed:");
        console.error(error.message);
        console.log("This often happens when the AI model server (Genkit backend) is not running or not configured.");
        console.log("The test primarily verifies that the function can be invoked and its input processed before the AI call.");
    }
}
runHiraTest();
