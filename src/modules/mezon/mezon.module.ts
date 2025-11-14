import { Module } from '@nestjs/common';
import { MezonService } from './services/mezon.service';
import { InteractionFactory } from './router/interaction-factory';
import { BaseHandler, InteractionEvent } from './handlers/base';
import { appConfig } from '../../appConfig';
import { MezonClient } from 'mezon-sdk';
import { EventRouter } from './router/event.router';
import { InitializationHandler } from './handlers/initialization.handler';
import { UserModule } from '../user/user.module';
import { ToeicModule } from '../toeic/toeic.module';
import { StartTestHandler } from './handlers/start-test.handler';
import { ToeicPartHandler } from './handlers/toeic-part.handler';
import { ToeicTestHandler } from './handlers/toeic-test.handler';
import { ConfirmStartTestHandler } from './handlers/confirm-start-test.handler';
import { SelectPartHandler } from './handlers/select-part.handler';
import { SelectTestHandler } from './handlers/select-test.handler';
import { UserAnswerHandler } from './handlers/user-answer.handler';
import { NextQuestionHandler } from './handlers/next-question.handler';
import { CancelTestHandler } from './handlers/cancel-test.handler';
import { TopicModule } from '../topic-vocabulary/topic.module';
import { AllTopicHandler } from './handlers/all-topic.handler';
import { ShowVocabularyHandler } from './handlers/vocabulary-of-topic.handler';
import { VocabularyModule } from '../vocabulary/vocabulary.module';
import { ContinueTestHandler } from './handlers/continue-test.handler';
import { RestartTestHandler } from './handlers/restart-test.handler';
import { HelpHandler } from './handlers/help.handler';
import { NextPartHandler } from './handlers/next-part.handler';
import { ReviewTestHandler } from './handlers/review-test.handler';
import { DailyReminderTask } from './handlers/reminder.handler';
import { SaveVocabularyHandler } from './handlers/save-vocabulary.handler';
import { FavoriteVocabularyModule } from '../favorite-vocabulary/favorite_vocabulary.module';
import { DailyModule } from '../daily/daily.module';
import { VocabularyOfUserHandler } from './handlers/vocabulary-of-user.handler';
import { ProfileHandler } from './handlers/profile.handler';
import { DeleteMyVocabulary } from './handlers/delete-vocabulary-of-user.handler';
import { GenerateTextHandler } from './handlers/generate-text.handler';
import { ToeicImportModule } from '../toeic-import/toeic-import.module';
import { GoogleAIModule } from '../google-ai/google-ai.module';
import { UserProgressHandler } from './handlers/user-progress.handler';
import { RandomWordHandler } from './handlers/random-word.handler';
import { PexelsService } from './services/pexels.service';
import { GuessWordAnswerHandler } from './handlers/guess-word-answer.handler';
import { ChannelModule } from '../channel/channel.module';
import { ELaKoTheHandler } from './handlers/elakhongthe.handler';
import { AnhDuyHandler } from './handlers/anhDuy.handler';

const commandHandlers = [
  StartTestHandler,
  InitializationHandler,
  ToeicPartHandler,
  ToeicTestHandler,
  ConfirmStartTestHandler,
  SelectPartHandler,
  SelectTestHandler,
  UserAnswerHandler,
  NextQuestionHandler,
  CancelTestHandler,
  AllTopicHandler,
  ShowVocabularyHandler,
  ContinueTestHandler,
  RestartTestHandler,
  HelpHandler,
  NextPartHandler,
  ReviewTestHandler,
  DailyReminderTask,
  SaveVocabularyHandler,
  VocabularyOfUserHandler,
  SaveVocabularyHandler,
  DailyReminderTask,
  ProfileHandler,
  DeleteMyVocabulary,
  GenerateTextHandler,
  ProfileHandler,
  DeleteMyVocabulary,
  GenerateTextHandler,
  UserProgressHandler,
  RandomWordHandler,
  GuessWordAnswerHandler,
  ELaKoTheHandler,
  AnhDuyHandler
];

@Module({
  imports: [
    UserModule,
    ToeicModule,
    TopicModule,
    VocabularyModule,
    FavoriteVocabularyModule,
    DailyModule,
    ToeicImportModule,
    GoogleAIModule,
    ChannelModule
  ],
  providers: [
    MezonService,
    EventRouter,
    PexelsService,
    ...commandHandlers,
    {
      provide: MezonClient,
      useFactory: async () => {
        const client = new MezonClient({
          botId: appConfig.bot.id,
          token: appConfig.bot.token,
        });
        await client.login();
        return client;
      },
    },
    {
      provide: InteractionFactory,
      useFactory: (...handlers: BaseHandler<InteractionEvent>[]): InteractionFactory =>
        new InteractionFactory(handlers),
      inject: [...commandHandlers],
    }
  ],
  exports: [
    MezonService
  ],
})
export class MezonModule { }
