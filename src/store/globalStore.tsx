/**
 * 全局store
 */
import { LocalStorage } from '@6653302wy/ts-utils';
import { FC, ReactElement, createContext, useCallback, useEffect, useState } from 'react';

export interface CustomRequest {
    opend: boolean;
    importCode: string;
    requestCode: string;
}

export interface OnlyDataExport {
    opend: boolean;
    paramName: string;
}

export interface ServiceInfo {
    name: string;
    url: string;
    desc?: string;
}

type GlobalStoreType = {
    savePath: string;
    setSavePath: (str: string) => void;

    jsonUrl: string;
    setJsonUrl: (str: string) => void;

    onlyDataExport: OnlyDataExport;
    updateOnlyDataExportInfo: (info: Partial<OnlyDataExport>) => void;

    customRequest: CustomRequest;
    updateCustomRequestInfo: (info: Partial<CustomRequest>) => void;

    serviceList: ServiceInfo[];
    updateServiceList: (info: ServiceInfo, index: number, isDelet?: boolean) => void;

    saveInLocalCache: (info: Partial<GlobalStoreType>) => void;
};

export const GlobalContext = createContext({} as GlobalStoreType);

const cacheData = LocalStorage.inst.getObj('cache') as GlobalStoreType;

export const GlobalStore: FC<{ children: ReactElement }> = ({ children }) => {
    const [savePath, setSavePath] = useState(cacheData?.savePath || '');
    const [jsonUrl, setJsonUrl] = useState(cacheData?.jsonUrl || '');
    const [onlyDataExport, setonlyDataExport] = useState({
        opend: cacheData?.onlyDataExport?.opend || false,
        paramName: 'data',
    });
    const [customRequest, setcustomRequest] = useState({
        opend: cacheData?.customRequest?.opend || false,
        importCode: cacheData?.customRequest.importCode || '',
        requestCode: cacheData?.customRequest.requestCode || '',
    });
    const [serviceList, setServiceList] = useState<ServiceInfo[]>(cacheData?.serviceList || []);

    const updateServiceList = useCallback((info: ServiceInfo, index: number, isDelet?: boolean) => {
        setServiceList((pre) => {
            const newlist = [...pre];
            if (isDelet && index !== -1) {
                newlist.splice(index, 1);
                return newlist;
            }

            if (index >= 0) newlist[index] = info;
            else newlist.push(info);
            return newlist;
        });
    }, []);

    const updateOnlyDataExportInfo = useCallback((info: Partial<OnlyDataExport>) => {
        setonlyDataExport((pre) => {
            return { ...pre, ...info };
        });
    }, []);

    const updateCustomRequestInfo = useCallback((info: Partial<CustomRequest>) => {
        setcustomRequest((pre) => {
            return { ...pre, ...info };
        });
    }, []);

    const saveInLocalCache = useCallback((info: Partial<GlobalStoreType>) => {
        const curCache = LocalStorage.inst.getObj('cache') as GlobalStoreType;
        LocalStorage.inst.setObj('cache', { ...curCache, ...info });
    }, []);

    useEffect(() => {
        saveInLocalCache({ savePath });
    }, [saveInLocalCache, savePath]);

    useEffect(() => {
        saveInLocalCache({ jsonUrl });
    }, [jsonUrl, saveInLocalCache]);

    useEffect(() => {
        saveInLocalCache({ onlyDataExport });
    }, [saveInLocalCache, onlyDataExport]);

    useEffect(() => {
        saveInLocalCache({ customRequest });
    }, [saveInLocalCache, customRequest]);

    useEffect(() => {
        saveInLocalCache({ serviceList });
    }, [saveInLocalCache, serviceList]);

    return (
        <GlobalContext.Provider
            value={{
                savePath,
                setSavePath,
                jsonUrl,
                setJsonUrl,
                onlyDataExport,
                updateOnlyDataExportInfo,
                customRequest,
                updateCustomRequestInfo,
                saveInLocalCache,
                serviceList,
                updateServiceList,
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};
