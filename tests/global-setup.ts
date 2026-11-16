import fs from "node:fs";
import { E2E_CONTENT_DIR } from "../playwright.config";

/** Every run starts from the built-in content. */
export default function globalSetup() {
  fs.rmSync(E2E_CONTENT_DIR, { recursive: true, force: true });
}
