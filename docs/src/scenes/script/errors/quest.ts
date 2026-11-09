import { Metamob, isMetamobError } from "@ix-xs/metamob.api";

const metamob = new Metamob();

try {
  const me = await metamob.me();
  console.log(`Signed in as ${me.username}`);
} catch (error) {
  if (!isMetamobError(error)) throw error;
  console.log(`${error.code}: ${error.message}`);
  process.exitCode = 1;
}
