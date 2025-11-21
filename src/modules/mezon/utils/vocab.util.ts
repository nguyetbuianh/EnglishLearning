import { EButtonMessageStyle, RadioFieldOption } from "mezon-sdk";
import { MChannelMessage, MMessageButtonClicked } from "../handlers/base";
import { Vocabulary } from "../../../entities/vocabulary.entity";

export async function parseVocabId(
  event: MMessageButtonClicked
): Promise<number[] | null> {
  const extra = event.extra_data;
  if (!extra) return null;

  try {
    const data = JSON.parse(extra);

    const vocabIds = Object.values(data)
      .flat()
      .map(Number)
      .filter((n) => Number.isFinite(n));

    return vocabIds.length > 0 ? vocabIds : null;
  } catch (e) {
    console.error("❌ Failed to parse extra_data:", extra, e);
    return null;
  }
}

export async function parseButtonId(event: MMessageButtonClicked | MChannelMessage): Promise<{ page: number, mezonUserId: string }> {
  const isButtonClicked = "button_id" in event;
  let page = 1;
  let mezonUserId: string;

  if (isButtonClicked) {
    const eventButton = event as MMessageButtonClicked;

    const buttonId = eventButton.button_id;

    const match = buttonId.match(/page:(\d+)_id:([A-Za-z0-9_-]+)/);
    if (match) {
      page = Number(match[1]);
      mezonUserId = match[2];
      return { page, mezonUserId };
    } else {
      console.warn("❗ Cannot read page/id from node_id:", buttonId);
      mezonUserId = eventButton.user_id;
      return { page, mezonUserId };
    }
  } else {
    mezonUserId = (event as MChannelMessage).sender_id;
    return { page, mezonUserId };
  }
}

export async function buildRadioOptions(vocabularies: Vocabulary[], page: number, limit: number): Promise<RadioFieldOption[]> {
  const radioOptions: RadioFieldOption[] = vocabularies
    .map((vocab, index) => {
      const number = (page - 1) * limit + index + 1;
      const details = [
        `🔊 ${vocab.pronounce || "—"} | 🧩 *${vocab.partOfSpeech || "N/A"}*`,
        `Mean: ${vocab.meaning}`,
        vocab.exampleSentence ? `💬 _${vocab.exampleSentence}_` : null,
      ]
        .filter(Boolean)
        .join("\n");

      return {
        name: `${index}`,
        label: `${number}. ${vocab.word}`,
        value: vocab.id.toString(),
        description: details,
        style: EButtonMessageStyle.SUCCESS,
      };
    });
  return radioOptions;
}


