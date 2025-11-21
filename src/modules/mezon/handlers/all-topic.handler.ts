import { Injectable, Scope } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler, MChannelMessage } from "./base";
import { EButtonMessageStyle, MezonClient } from "mezon-sdk";
import { TopicService } from "../../topic-vocabulary/topic.service";
import { MessageBuilder } from "../builders/message.builder";
import { SelectionBuilder } from "../builders/selection.builder";
import { CommandType } from "../enums/commands.enum";
import { updateSession } from "../utils/update-session.util";
import { ButtonBuilder } from "../builders/button.builder";

@Injectable({ scope: Scope.TRANSIENT })
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

      const mezonUserId = this.event.sender_id;
      if (!mezonUserId) return;

      const selectionTopic = new SelectionBuilder()
        .setId(`show-vocabulary_id:${mezonUserId}`)
        .setPlaceholder("Select a topic...")
        .addOptions(
          topicVocabularies.map((topic) => ({
            label: `📘 ${topic.name}`,
            type: topic.type || "_(No category provided)_",
            value: `show-vocabulary_topic:${topic.id}_page:1`,
          }))
        )
        .build();

      const cancelButton = new ButtonBuilder()
        .setId(`cancel-test_id:${mezonUserId}`)
        .setLabel("❌ Cancel")
        .setStyle(EButtonMessageStyle.DANGER)
        .build();

      const messagePayload = new MessageBuilder()
        .createEmbed({
          color: "#3498db",
          title: "🎯 Topic Vocabulary Selection",
          description: "Select the topic you want to learn from the list below:",
        })
        .addSelectRow([selectionTopic])
        .addButtonsRow([cancelButton])
        .build();

      const replyMessage = await this.mezonMessage.reply(messagePayload);
      await updateSession(this.mezonMessage.sender_id, undefined, replyMessage.message_id);
    } catch (error) {
      await this.mezonMessage.reply({
        t: "⚠️ An error occurred while loading the topic vocabularies. Please try again later.",
      });
    }
  }
}
