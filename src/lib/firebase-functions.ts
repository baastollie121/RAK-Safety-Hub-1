import { getFunctions } from "firebase/functions";
import { app } from "./firebase";

// It's recommended to specify the region for your functions
// For example: const functions = getFunctions(app, 'us-central1');
export const functions = getFunctions(app);
