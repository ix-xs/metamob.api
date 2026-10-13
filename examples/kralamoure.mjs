// Prints the coming Kralamoure openings of a server, with who signed up.
//
//   METAMOB_API_KEY=... node examples/kralamoure.mjs Draconiros

import { Metamob, isMetamobError } from "@ix-xs/metamob.api";

const metamob = new Metamob(); // reads METAMOB_API_KEY
const server = process.argv[2] ?? "Draconiros";

try {
  const events = await metamob.kralove.list({ server, from: new Date() });
  if (!events.length) console.log(`Nothing planned on ${server}.`);

  for (const event of events) {
    const detail = await metamob.kralove.get(event);
    const when = new Date(event.event_datetime.replace(" ", "T")).toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short" });
    console.log(`${when}, by ${event.creator ?? "a deleted account"}: ${event.character_count} characters`);
    if (event.description) console.log(`  ${event.description}`);
    for (const participant of detail.participants) {
      console.log(`  ${participant.username ?? "a deleted account"} x${participant.character_count}`);
    }
  }
} catch (error) {
  // A server name with a typo is refused with the closest names.
  if (isMetamobError(error, "UNKNOWN_NAME")) console.error(error.message);
  else throw error;
}
