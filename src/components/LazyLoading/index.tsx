import { Spin } from '@arco-design/web-react';
import { FunctionComponent, ReactElement } from 'react';

export const LazyLoading: FunctionComponent = (): ReactElement => {
    return (
        <div className="w-full bg-bg-white flex justify-center items-center ">
            <Spin dot />
        </div>
    );
};

LazyLoading.displayName = 'LazyLoading';
