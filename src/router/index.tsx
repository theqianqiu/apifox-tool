import { FC } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Home } from '../screen/home';
import { RoutersMap } from './routeList';

export const Routers: FC = () => {
    return (
        <BrowserRouter basename={process.env.ROUTER_BASE}>
            <Routes>
                <>
                    <Route index element={<Home />} />
                    {/* <Route path="*" element={<NotFound />} /> */}
                    <Route>
                        {RoutersMap.single.map((route, index) => {
                            return <Route key={index} path={route.path} element={route.element} />;
                        })}
                    </Route>
                    {/* <Route
                        element={
                            <AppLayOut>
                                <Outlet />
                            </AppLayOut>
                        }
                    >
                        {RoutersMap.layout.map((route, index) => {
                            return <Route key={index} path={route.path} element={route.element} />;
                        })}
                    </Route> */}
                </>
            </Routes>
        </BrowserRouter>
    );
};

Routers.displayName = 'Routers';
