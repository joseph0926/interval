import "./index.css";
import Entry from "./entry.tsx";
import { createFirstTxRoot } from "@firsttx/prepaint";

createFirstTxRoot(document.getElementById("root")!, <Entry />, {
	transition: true,
});
