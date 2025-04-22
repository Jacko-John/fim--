import Anthropic from "@anthropic-ai/sdk";
import { ApiStream } from "./transform/steams";

export interface ApiHandler {
  createMessage(
    systemPrompt: string,
    messages: Anthropic.Messages.MessageParam[],
  ): ApiStream;
}
