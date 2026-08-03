import { DemoDataProvider } from "../src/lib/data/demo/DemoDataProvider";
import { validateLeagueData } from "../src/lib/model/validation/leagueValidation";

async function main() {
  const provider = new DemoDataProvider();
  const snapshot = await provider.load();

  console.log(`Status: ${snapshot.status}`);
  console.log(`Hold: ${snapshot.teams.length}`);
  console.log(`Kampe: ${snapshot.fixtures.length}`);

  const result = validateLeagueData(snapshot.teams, snapshot.fixtures, {
    enforceProductionRules: true,
  });

  if (result.valid) {
    console.log("✓ Demo-datasættet er gyldigt.");
    process.exit(0);
  } else {
    console.error("✗ Demo-datasættet fejlede validering:");
    for (const issue of result.issues) {
      console.error(`  [${issue.code}] ${issue.message}`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Uventet fejl under validering:", err);
  process.exit(1);
});
