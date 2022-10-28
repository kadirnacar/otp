/* eslint-disable no-case-declarations */
import { Action, Reducer } from 'redux';
import {
  Actions,
  IChangeDirectionAction,
  IChangeLayoutAction,
  IChangeModeAction,
  IChangeThemeAction,
  ICloseMenuAction,
  IOpenAction,
  IOpenMenuAction,
  IPlayTransitionAction,
  IToggleAction,
  UiState,
} from './state';

const unloadedState: UiState = {
  /* Settings for Themes and layout */
  theme: 'redTheme',
  type: 'dark', // light or dark
  /* End settings */
  palette: [
    { name: 'Red', value: 'redTheme' },
    { name: 'Green', value: 'greenTheme' },
    { name: 'Blue', value: 'blueTheme' },
    { name: 'Purple', value: 'purpleTheme' },
    { name: 'Orange', value: 'orangeTheme' },
    { name: 'Grey', value: 'greyTheme' },
    { name: 'Green Light', value: 'lightGreenTheme' },
    { name: 'Blue Light', value: 'lightBlueTheme' },
    { name: 'Brown', value: 'brownTheme' },
  ],
  sidebarOpen: true,
  pageLoaded: false,
  subMenuOpen: [],
  layout: 'big-sidebar',
  direction: 'ltr',
};

export type KnownAction =
  | IChangeThemeAction
  | IPlayTransitionAction
  | ICloseMenuAction
  | IOpenMenuAction
  | IChangeDirectionAction
  | IChangeLayoutAction
  | IOpenAction
  | IToggleAction
  | IChangeModeAction;



export const reducer: Reducer<UiState> = (
  currentState: UiState = unloadedState,
  incomingAction: Action
) => {
  const action = incomingAction as KnownAction;

  switch (action.type) {
    case Actions.CHANGE_MODE:
      currentState.type = action.payload;
      return { ...currentState };
    case Actions.CHANGE_THEME:
      currentState.theme = action.payload;
      return { ...currentState };
    case Actions.CLOSE_MENU:
      currentState.sidebarOpen = false;
      return { ...currentState };
    case Actions.LOAD_PAGE:
      currentState.pageLoaded = action.payload;
      return { ...currentState };
    case Actions.OPEN_MENU:
      currentState.sidebarOpen = true;
      return { ...currentState };
    case Actions.OPEN_SUBMENU:
      currentState.subMenuOpen = action.payload;
      return { ...currentState };
    case Actions.TOGGLE_SIDEBAR:
      currentState.sidebarOpen = !currentState.sidebarOpen;
      return { ...currentState };
    case Actions.CHANGE_DIRECTION:
      currentState.direction = action.payload;
      return { ...currentState };
    case Actions.CHANGE_LAYOUT:
      currentState.layout = action.payload;
      return { ...currentState };

    default:
      break;
  }
  return currentState || unloadedState;
};
