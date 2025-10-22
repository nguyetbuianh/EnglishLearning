import { Injectable } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler, MChannelMessage, MDropdownBoxSelected, MMessageButtonClicked } from "./base";
import { EButtonMessageStyle, MezonClient } from "mezon-sdk";
import { TopicService } from "src/modules/topic-vocabulary/topic.service";
import { MessageBuilder } from "../builders/message.builder";
import { SelectionBuilder } from "../builders/selection.builder";
import { ButtonBuilder } from "../builders/button.builder";
import { CommandType } from "../enums/commands.enum";

@Injectable()
@Interaction(CommandType.COMMAND_ALL_TOPIC)
export class AllTopicHandler extends BaseHandler<MChannelMessage> {
  constructor(
    protected readonly client: MezonClient,
    private readonly topicService: TopicService
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      const topicVocabularies = await this.topicService.getAllTopics();

      if (!topicVocabularies || topicVocabularies.length === 0) {
        await this.mezonMessage.reply({
          t: "❌ No Topic Vocabulary found. Please add some topics first to display them here.",
        });
        return;
      }

      const senderId = this.mezonMessage.sender_id;

      const selectionTopic = new SelectionBuilder()
        .setId(`show-vocabulary_id:${senderId}`)
        .setPlaceholder("Select a topic...")
        .addOptions(
          topicVocabularies.map((topic) => ({
            label: `📘 ${topic.name}`,
            type: topic.type || "_(No category provided)_",
            value: String(topic.id),
          }))
        )

        .build();
      const messagePayload = new MessageBuilder()
        .createEmbed({
          color: "#3498db",
          title: "🎯 Topic Vocabulary Selection",
          description: "Select the topic you want to learn from the list below:",
        })
        .addSelectRow([selectionTopic])
        .build();

      await this.mezonMessage.reply(messagePayload);
    } catch (error) {
      await this.mezonMessage.reply({
        t: "⚠️ An error occurred while loading the topic vocabularies. Please try again later.",
      });
    }
  }
}
