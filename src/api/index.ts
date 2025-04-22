import { ApiStream } from "./transform/steams";

export interface ApiHandler {
  createCompletion(systemPrompt: string): ApiStream;
}
