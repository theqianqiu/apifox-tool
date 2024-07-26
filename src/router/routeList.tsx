import { ReactElement, ReactNode } from 'react';

import { Home } from '../screen/home';
import { RouterEnum } from './constans';

interface RouterInfo {
    path: string;
    title?: string;
    icon?: ReactNode;
    element: ReactElement;
    children?: RouterInfo[];
}
interface RouterType {
    [key: string]: RouterInfo[];
}

export const RoutersMap: RouterType = {
    /** 没有统一layout的路由页面 */
    single: [
        {
            path: RouterEnum.HOME,
            element: <Home />,
        },
    ],
    layout: [],
};
