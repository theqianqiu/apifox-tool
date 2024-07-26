import { FunctionComponent, ReactElement, useCallback, useEffect, useState } from 'react';
import styles from './styles.css';

export const Setting: FunctionComponent = (): ReactElement => {
    return (
        <div className={styles.container}>
            <p>{'Setting'}</p>
        </div>
    );
};

Setting.displayName = 'Setting';
