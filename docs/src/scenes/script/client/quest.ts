import { Metamob } from "@ix-xs/metamob.api";

const metamob = new Metamob();

const me = await metamob.me();
console.log(`Signed in as ${me.username}`);
