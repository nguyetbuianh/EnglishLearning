import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler, MChannelMessage } from "./base";
import { MezonClient } from "mezon-sdk";
import { ToeicImportService } from "../../toeic-import/toeic-import.service"; 
import axios from "axios";

@Injectable()
@Interaction("gen-text")
export class GenerateTextHandler extends BaseHandler<MChannelMessage> {
  private readonly logger = new Logger(GenerateTextHandler.name);

  constructor(
    protected readonly client: MezonClient,
    private readonly toeicImportService: ToeicImportService
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    const mezonUserId = this.event.sender_id;
    if (
      mezonUserId !== process.env.MEZON_BOT_ID_1 ||
      mezonUserId !== process.env.MEZON_BOT_ID_2 ||
      mezonUserId !== process.env.MEZON_BOT_ID_3
    ) {
      await this.mezonMessage.reply({
        t: "❌ You have no rights !!"
      });
    }
    const content = this.event.content.t || "";
    const cleaned = content.replace('*gen-text ', '').trim();
    const [test, part, qaItem] = cleaned.split('_');

    const testNumber = Number(test);
    const partNumber = Number(part);

    const attachments = this.event.attachments;
    if (!attachments?.length) {
      this.mezonMessage.reply
      return;
    }

    const pdfFile = attachments[0];
    const pdfUrl = pdfFile.url;
    const fileName = pdfFile.filename;

    if (!pdfUrl || !fileName) {
      throw new BadRequestException("Missing file information (url or file name).");
    }

    if (!fileName.toLowerCase().endsWith(".pdf")) {
      throw new BadRequestException(`File "${fileName}" is not a PDF.`);
    }

    try {
      const response = await axios.get(pdfUrl, { responseType: "arraybuffer" });
      const pdfBuffer = Buffer.from(response.data);

      const textResult = await this.toeicImportService.uploadPDF(testNumber, partNumber, qaItem, pdfBuffer);
      this.logger.log(textResult);
      this.mezonMessage.reply({
        t: `✅ Successfully created the question list from the PDF file!`,
      });
    } catch (error) {
    }
  }
}
