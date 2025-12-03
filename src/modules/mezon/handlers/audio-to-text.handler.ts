import { Injectable, Scope } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler, MChannelMessage } from "./base";
import { ChannelMessageAck, MezonClient } from "mezon-sdk";
import { CommandType } from "../enums/commands.enum";
import axios from "axios";
import FormData from "form-data";
import { MessageBuilder } from "../builders/message.builder";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";

@Injectable({ scope: Scope.TRANSIENT })
@Interaction(CommandType.COMMAND_CONVERT_SPEECH_TO_TEXT)
export class SpeechToTextHandler extends BaseHandler<MChannelMessage> {
  private BASE_URL = 'http://127.0.0.1:3000';
  constructor(
    protected readonly client: MezonClient
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      if (!this.event.attachments || this.event.attachments.length === 0) return;

      const audio = this.event.attachments[0].url;
      if (!audio) return;
      const { data, mezonMsg } = await this.generateText(audio, this.mezonMessage);

      const messagePayload = new MessageBuilder()
        .createEmbed({
          color: "#3498db",
          title: `Text to Speech`,
          description: `Here is the audio message generated from text: ${data}`,
        })
        .build();

      const updateMessage = await this.mezonChannel.messages.fetch(String(mezonMsg.message_id));
      await updateMessage.update(
        messagePayload,
        undefined,
        messagePayload.attachments
      );
    } catch (error) {
      console.error("Error:", error);
      await this.mezonChannel.sendEphemeral(
        this.event.sender_id,
        { t: "😢 Oops! Something went wrong. Please try again later!" }
      );
    }
  }

  async generateText(audioUrl: string, mezonMessage: Message): Promise<{ data: string, mezonMsg: ChannelMessageAck }> {
    const response = await axios.get(audioUrl, { responseType: "arraybuffer" });

    const formData = new FormData();
    formData.append("audio", Buffer.from(response.data), "audio.wav");

    const createRes = await axios.post(`${this.BASE_URL}/speech-to-text`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    const jobId = createRes.data.jobId;
    if (!jobId) throw new Error("Job ID not returned from server");

    const mezonMsg = await mezonMessage.reply(
      { t: "⏳ Processing your audio, please wait..." }
    );

    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 1000));

      const pollRes = await axios.get(`${this.BASE_URL}/result/${jobId}`);

      if (pollRes.data.text) {
        return {
          data: pollRes.data.text,
          mezonMsg: mezonMsg
        };
      }
    }

    throw new Error("Speech to text job timed out after 15 seconds");
  }
}