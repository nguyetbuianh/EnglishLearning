import { Injectable, Scope } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler, MMessageButtonClicked } from "./base";
import { MezonClient } from "mezon-sdk";
import { CommandType } from "../enums/commands.enum";
import axios from "axios";
import { MessageBuilder } from "../builders/message.builder";
import { appConfig } from "../../../appConfig";

@Injectable({ scope: Scope.TRANSIENT })
@Interaction(CommandType.BUTTON_CONVERT_TEXT_TO_SPEECH)
export class TextToSpeechHandler extends BaseHandler<MMessageButtonClicked> {
  private BASE_URL = 'https://api2.ttsforfree.com/api/tts';
  constructor(
    protected readonly client: MezonClient
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      const text = await this.getText();
      if (!text) {
        await this.mezonChannel.sendEphemeral(
          this.event.user_id,
          { t: "⚠️ Please provide the text to convert to speech." }
        );
        return;
      }

      const audioUrl = await this.generateAudio(text);

      const messagePayload = new MessageBuilder()
        .createEmbed({
          color: "#3498db",
          title: `Text to Speech`,
          description: `Here is the audio message generated from text: ${text}`,
          audioUrl: audioUrl
        })
        .build();

      await this.mezonMessage.update(
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

  async generateAudio(text: string): Promise<string> {
    const createBody = {
      Texts: text,
      Voice: "v1:YPj2X6j04RZcJdGzo-CC0GBpkJ985PD5X_VWU_nJkNzppGtbnxJL-dU_hglv",
      Pitch: 0,
      ConnectionId: "",
      CallbackUrl: ""
    };

    let createRes = await axios.post(`${this.BASE_URL}/createby`, createBody, {
      headers: {
        "X-API-Key": appConfig.TTSForFree.API_KEY,
        "Content-Type": "application/json",
      },
    });

    let { Status, Data } = createRes.data;

    if (Status === "SUCCESS" && Data) {
      return `${this.BASE_URL}/StreamFile?filename=${Data}`;
    }

    if (Status === "PENDING") {
      for (let i = 0; i < 15; i++) {
        await new Promise(r => setTimeout(r, 2000)); 

        createRes = await axios.post(`${this.BASE_URL}/createby`, createBody, {
          headers: {
            "X-API-Key": appConfig.TTSForFree.API_KEY,
            "Content-Type": "application/json",
          },
        });

        Status = createRes.data.Status;
        Data = createRes.data.Data;

        if (Status === "SUCCESS" && Data) {
          return `${this.BASE_URL}/StreamFile?filename=${Data}`;
        }
      }

      throw new Error("TTS job timed out after polling");
    }

    throw new Error("TTS job failed: " + JSON.stringify(createRes.data));
  }

  private async getText(): Promise<string | null> {
    const extra_data = this.event.extra_data;
    if (!extra_data) {
      return null;
    }
    const parsed = JSON.parse(extra_data);
    const text: string = parsed["form-text"];

    return text;
  }
}