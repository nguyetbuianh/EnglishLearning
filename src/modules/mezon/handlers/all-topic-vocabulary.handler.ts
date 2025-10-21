import { Injectable } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler, MMessageButtonClicked } from "./base";
import { ChannelMessageContent, IInteractiveMessageProps, MezonClient } from "mezon-sdk";
import { TopicVocabularyService } from "src/modules/topic-vocabulary/topic-vocabulary.service";

@Injectable()
@Interaction("all-topic")
export class AllTopicVocabularyHandler extends BaseHandler<MMessageButtonClicked> {
  constructor(
    protected readonly client: MezonClient,
    private readonly topicVocabularyService: TopicVocabularyService
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      const topicVocabularies = await this.topicVocabularyService.getAllTopicVocabularies();

      if (!topicVocabularies || topicVocabularies.length === 0) {
        await this.mezonMessage.reply({
          t: "❌ No Topic Vocabulary found. Please add some topics first to display them here.",
        });
        return;
      }

      const listTopicVocabularies = topicVocabularies.map((topic) => ({
        name: `📘 ${topic.name}`,
        type: topic.type || "_(No category provided)_",
        value: topic.description || "_(No description available)_",
      }));

      const embed: IInteractiveMessageProps = {
        color: "#3b82f6", // Màu xanh dịu hơn cho dễ nhìn
        title: "📚 TOEIC Topic Vocabulary Overview",
        description:
          "Here are all the available **TOEIC Vocabulary Topics** in the system.\n\n" +
          "Each topic helps you focus on specific vocabulary areas commonly tested in the TOEIC exam. " +
          "Select a topic to start exploring useful words and phrases.",
        fields: listTopicVocabularies,
        footer: {
          text: "Expand your vocabulary one topic at a time 💪",
        },
        timestamp: new Date().toISOString(),
      };

      const messagePayload: ChannelMessageContent = {
        t: "✨ TOEIC Vocabulary Topics",
        embed: [embed],
      };

      await this.mezonMessage.reply(messagePayload);
    } catch (error) {
      await this.mezonMessage.reply({
        t: "⚠️ An error occurred while loading the topic vocabularies. Please try again later.",
      });
    }
  }
}
