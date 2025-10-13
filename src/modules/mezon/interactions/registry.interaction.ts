import { InteractionListener } from "../enums/interaction-listener.enum";
import {
  cancelToeicTestHandler,
  selectToeicTestHandler,
  startToeicTestHandler
} from "./handlers/toeic-part.handler";

export const buttonhandler = {
  [InteractionListener.TOEIC_START_TEST]: startToeicTestHandler,
  [InteractionListener.TOEIC_CANCEL_TEST]: cancelToeicTestHandler
}

export const selectHandler = {
  [InteractionListener.TOEIC_TEST_SELECT]: selectToeicTestHandler,
}