// testHiraDataProcessing.ts
/**
 * Simulates the data processing part of the HIRA generation flow.
 * Specifically calculates initialRisk and residualRisk.
 */
function simulateHiraDataProcessing(input) {
    console.log("Simulating HIRA data processing...");
    const processedHazards = input.hazards.map(h => (Object.assign(Object.assign({}, h), { initialRisk: h.initialLikelihood * h.initialConsequence, residualRisk: h.residualLikelihood * h.residualConsequence })));
    const promptInput = Object.assign(Object.assign({}, input), { hazards: processedHazards });
    return promptInput;
}
// Run the simulation test
function runHiraDataProcessingTest() {
    console.log("Starting HIRA Data Processing simulation test...");
    const mockInput = {
        companyName: "Test Company",
        taskTitle: "Testing Risk Calculations",
        reviewDate: "2024-01-01",
        hazards: [
            {
                hazard: "Hazard A",
                personsAffected: "Workers",
                initialLikelihood: 4,
                initialConsequence: 5, // Expected initialRisk: 20
                controlMeasures: "Measures A",
                residualLikelihood: 1,
                residualConsequence: 2, // Expected residualRisk: 2
            },
            {
                hazard: "Hazard B",
                personsAffected: "Public",
                initialLikelihood: 3,
                initialConsequence: 2, // Expected initialRisk: 6
                controlMeasures: "Measures B",
                residualLikelihood: 2,
                residualConsequence: 1, // Expected residualRisk: 2
            },
            {
                hazard: "Hazard C",
                personsAffected: "All",
                initialLikelihood: 1,
                initialConsequence: 1, // Expected initialRisk: 1
                controlMeasures: "Measures C",
                residualLikelihood: 1,
                residualConsequence: 1, // Expected residualRisk: 1
            },
        ],
    };
    try {
        const result = simulateHiraDataProcessing(mockInput);
        console.log("Data processing simulation complete. Checking results:");
        result.hazards.forEach((hazard, index) => {
            console.log(`
Hazard ${index + 1}: ${hazard.hazard}`);
            console.log(`  Input: InitialL=${hazard.initialLikelihood}, InitialC=${hazard.initialConsequence}`);
            console.log(`  Calculated Initial Risk: ${hazard.initialRisk}`);
            console.log(`  Expected Initial Risk: ${mockInput.hazards[index].initialLikelihood * mockInput.hazards[index].initialConsequence}`);
            console.log(`  Input: ResidualL=${hazard.residualLikelihood}, ResidualC=${hazard.residualConsequence}`);
            console.log(`  Calculated Residual Risk: ${hazard.residualRisk}`);
            console.log(`  Expected Residual Risk: ${mockInput.hazards[index].residualLikelihood * mockInput.hazards[index].residualConsequence}`);
            // Simple assertion
            if (hazard.initialRisk !== (mockInput.hazards[index].initialLikelihood * mockInput.hazards[index].initialConsequence)) {
                console.error(`ERROR: Initial Risk calculation incorrect for Hazard ${hazard.hazard}`);
            }
            if (hazard.residualRisk !== (mockInput.hazards[index].residualLikelihood * mockInput.hazards[index].residualConsequence)) {
                console.error(`ERROR: Residual Risk calculation incorrect for Hazard ${hazard.hazard}`);
            }
        });
        console.log(", Data, processing, test, concluded.Check, logs);
        for (any; errors.; ");)
            ;
    }
    catch (error) {
        console.error("An error occurred during HIRA data processing simulation:", error.message);
    }
}
runHiraDataProcessingTest();
