import React from 'react';

export interface IAppContext {}

export const AppContext = React.createContext<IAppContext>({});
