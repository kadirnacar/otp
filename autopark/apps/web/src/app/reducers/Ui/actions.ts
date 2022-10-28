import { ApplicationState } from '../../store';
import { Actions } from './state';
import MenuContent from '../../../mocks/menu';

const setNavCollapse = (arr, curRoute) => {
  let headMenu = 'not found';
  for (let i = 0; i < arr.length; i += 1) {
    for (let j = 0; j < arr[i].length; j += 1) {
      if (arr[i][j].link === curRoute) {
        headMenu = MenuContent[i].key;
      }
    }
  }
  return headMenu;
};

const getMenus = (menuArray) =>
  menuArray.map((item) => {
    if (item.child) {
      return item.child;
    }
    return false;
  });

export class UiActions {
  changeMode = (mode: 'light' | 'dark') =>
    function (dispatch, getState: () => ApplicationState) {
      dispatch({ type: Actions.CHANGE_MODE, payload: mode });
    };

  changeTheme = (theme: string) =>
    function (dispatch, getState: () => ApplicationState) {
      dispatch({ type: Actions.CHANGE_THEME, payload: theme });
    };

  changeDirection = (direction: 'ltr' | 'rtl') =>
    function (dispatch, getState: () => ApplicationState) {
      dispatch({ type: Actions.CHANGE_DIRECTION, payload: direction });
    };

  changeLayout = (layout: 'big-sidebar' | 'big-sidebar' | 'top-navigation' | 'mega-menu') =>
    function (dispatch, getState: () => ApplicationState) {
      dispatch({ type: Actions.CHANGE_LAYOUT, payload: layout });
    };

  closeMenu = () =>
    function (dispatch, getState: () => ApplicationState) {
      dispatch({ type: Actions.CLOSE_MENU });
    };

  loadPage = (isLoaded: boolean) =>
    function (dispatch, getState: () => ApplicationState) {
      dispatch({ type: Actions.LOAD_PAGE, payload: isLoaded });
    };

  openMenu = () =>
    function (dispatch, getState: () => ApplicationState) {
      dispatch({ type: Actions.OPEN_MENU });
    };

  openSubMenu = (items: any) =>
    function (dispatch, getState: () => ApplicationState) {
      const activeParent = setNavCollapse(getMenus(MenuContent), items);
      // // Once page loaded will expand the parent menu
      if (items) {
        dispatch({ type: Actions.OPEN_SUBMENU, payload: [activeParent] });
        return;
      }
      const state = getState();
      // // Expand / Collapse parent menu
      const menuList = state.Ui.subMenuOpen;
      // if (menuList.indexOf(action.key) > -1) {
        // if (action.keyParent) {
        //   mutableState.set('subMenuOpen', List([action.keyParent]));
        // } else {
        //   mutableState.set('subMenuOpen', List([]));
        // }
      // } else {
      //   mutableState.set('subMenuOpen', List([action.key, action.keyParent]));
      // }

      // dispatch({ type: Actions.OPEN_SUBMENU, payload: items });
    };

  toggleSidebar = () =>
    function (dispatch, getState: () => ApplicationState) {
      dispatch({ type: Actions.TOGGLE_SIDEBAR });
    };
}
