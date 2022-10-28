/* eslint-disable @typescript-eslint/no-explicit-any */

export enum Actions {
  TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR',
  OPEN_MENU = 'OPEN_MENU',
  CLOSE_MENU = 'CLOSE_MENU',
  OPEN_SUBMENU = 'OPEN_SUBMENU',
  CHANGE_THEME = 'CHANGE_THEME',
  CHANGE_MODE = 'CHANGE_MODE',
  LOAD_PAGE = 'LOAD_PAGE',
  CHANGE_LAYOUT = 'CHANGE_LAYOUT',
  CHANGE_DIRECTION = 'CHANGE_DIRECTION',
}

export interface UiState {
  theme: string;
  type: 'light' | 'dark'; // light or dark
  direction: 'ltr' | 'rtl'; // ltr or rtl
  layout: 'big-sidebar' | 'big-sidebar' | 'top-navigation' | 'mega-menu'; // sidebar, big-sidebar, top-navigation, mega-menu
  palette: { name: string; value: string }[];
  sidebarOpen: boolean;
  pageLoaded: boolean;
  subMenuOpen: any[];
}

export interface IToggleAction {
  type: Actions.TOGGLE_SIDEBAR;
}

export interface IOpenMenuAction {
  type: Actions.OPEN_MENU;
}

export interface ICloseMenuAction {
  type: Actions.CLOSE_MENU;
}

export interface IOpenAction {
  type: Actions.OPEN_SUBMENU;
  payload: any[];
}

export interface IChangeThemeAction {
  type: Actions.CHANGE_THEME;
  payload: any;
}

export interface IChangeModeAction {
  type: Actions.CHANGE_MODE;
  payload: 'light' | 'dark';
}

export interface IChangeLayoutAction {
  type: Actions.CHANGE_LAYOUT;
  payload: 'big-sidebar' | 'big-sidebar' | 'top-navigation' | 'mega-menu';
}

export interface IChangeDirectionAction {
  type: Actions.CHANGE_DIRECTION;
  payload: 'ltr' | 'rtl';
}

export interface IPlayTransitionAction {
  type: Actions.LOAD_PAGE;
  payload: boolean;
}
