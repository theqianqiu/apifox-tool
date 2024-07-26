/* eslint-disable prefer-regex-literals */
/* eslint-disable max-lines-per-function */
import { Button, Divider, Input, Message, Radio, Tooltip, Upload } from '@arco-design/web-react';
import { UploadItem } from '@arco-design/web-react/es/Upload';
import { IconList, IconPaste, IconShareExternal } from '@arco-design/web-react/icon';
import { open } from '@tauri-apps/api/dialog';
import { downloadDir } from '@tauri-apps/api/path';
import classNames from 'classnames';
import { FunctionComponent, ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../../../../store/globalStore';
import { JsonDataInfo, Parser } from '../../../../utils/Parser';
import { AddServerPop } from './components/AddServerPop';
import { CustomRequestOption } from './components/CustomRequestOption';
import { OnlyDataExportCom } from './components/OnlyDataExport';

const parser = new Parser();

enum ExportType {
    JSON = 'JSON',
    URL = 'URL',
}

const isAcceptFile = (file: File, accept: string) => {
    if (accept && file) {
        // const accepts = Array.isArray(accept)
        //     ? accept
        //     : accept
        //           .split(',')
        //           .map((x) => x.trim())
        //           .filter((x) => x);
        const fileExtension = file.name.indexOf('.') > -1 ? file.name.split('.').pop() : '';
        // console.log('fileExtension: ', fileExtension);
        return fileExtension === accept;
    }
    return !!file;
};

const leftCls = 'ml-[60px]';
export const Generate: FunctionComponent = (): ReactElement => {
    const [jsonData, setJsonData] = useState<JsonDataInfo>({} as JsonDataInfo);
    const [exportType, setExportType] = useState<ExportType>(ExportType.URL);
    const [showAddServerPop, setShowAddServerPop] = useState(false);

    const { savePath, setSavePath, jsonUrl, setJsonUrl, onlyDataExport, customRequest, serviceList } =
        useContext(GlobalContext);

    const onSaveOutputDir = useCallback(async () => {
        const filePath = await open({
            directory: true,
            multiple: false,
            title: '请选择文件导出目录',
            defaultPath: await downloadDir(),
        });
        setSavePath((filePath as string) || '');
    }, [setSavePath]);

    const onSaveJsonUrl = useCallback(
        (value: string) => {
            setJsonUrl(value);
        },
        [setJsonUrl],
    );

    const setDownloadDir = useCallback(async () => {
        if (savePath) return;
        setSavePath((await downloadDir()) || '');
    }, [savePath, setSavePath]);

    const onFileUploaded = (files: UploadItem[]) => {
        const file = files[0]?.originFile;

        if (!file) return;

        const reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = (fileReader) => {
            const fileData = fileReader?.target?.result;
            setJsonData(JSON.parse(fileData as string) as JsonDataInfo);
        };
    };

    const onCreateCodeClick = useCallback(() => {
        if (exportType === ExportType.URL) {
            parser.start(savePath, jsonUrl);
        } else parser.start(savePath, undefined, jsonData);
    }, [exportType, jsonData, jsonUrl, savePath]);

    useEffect(() => {
        parser.dataExport = onlyDataExport;
    }, [onlyDataExport]);

    useEffect(() => {
        parser.customCode = customRequest;
    }, [customRequest]);

    useEffect(() => {
        parser.serviceList = serviceList;
    }, [serviceList]);

    useEffect(() => {
        setDownloadDir();
    }, [setDownloadDir]);

    return (
        <div className=" relative overflow-hidden">
            <div className={classNames('my-6', leftCls)}>
                <span className=" mr-2 w-20 inline-block ">生成目录: </span>
                <Input style={{ width: 460 }} value={savePath} className=" mr-4 " />
                <Button onClick={onSaveOutputDir}>浏览</Button>
            </div>

            <OnlyDataExportCom classname={leftCls} />

            <CustomRequestOption classname={leftCls} />

            <Divider />

            <Radio.Group
                value={exportType}
                options={[
                    { label: '从URL生成', value: ExportType.URL },
                    { label: '从JSON文件生成', value: ExportType.JSON },
                ]}
                onChange={(value) => setExportType(value as ExportType)}
                className={classNames('mb-6', leftCls)}
            />

            {exportType === ExportType.URL ? (
                <div className={classNames('my-2', leftCls)}>
                    <span className=" mr-4 w-20 inline-block">JSON URL:</span>
                    <Input
                        style={{ width: 460 }}
                        className=" mr-2 "
                        defaultValue={jsonUrl}
                        placeholder="输入Swagger的JSON文件URL"
                        onChange={(value) => onSaveJsonUrl(value)}
                    />
                </div>
            ) : (
                <div className="w-full flex justify-center items-center ">
                    <Upload
                        drag
                        style={{ width: 380 }}
                        multiple={false}
                        // limit={1}
                        accept=".json"
                        directory={false}
                        showUploadList={false}
                        onDrop={(e) => {
                            const uploadFile = e.dataTransfer.files[0];
                            if (!isAcceptFile(uploadFile, 'json'))
                                Message.info('不接受的文件类型，请重新上传指定文件类型~');
                        }}
                        onChange={onFileUploaded}
                    >
                        <div className="w-[380px] h-[80px] flex flex-col justify-center items-center border border-dashed border-[var(--color-fill-4)] rounded text-center bg-[var(--color-fill-2)] ">
                            {!jsonData?.tags?.length ? (
                                <>
                                    <IconShareExternal style={{ fontSize: 24, color: '#3680E8' }} />
                                    <p className="whitespace-pre-wrap">点击或拖拽文件到此区域</p>
                                    <p className="text-[12px] text-[#87888F] mt-1">OpenAPI/Swagger的JSON文件</p>
                                </>
                            ) : (
                                <>
                                    <IconPaste style={{ fontSize: 24, color: '#3680E8' }} />
                                    <p className="mt-1 text-[12px]  text-[#87888F] ">点击或拖拽重新上传</p>
                                </>
                            )}
                        </div>
                    </Upload>
                </div>
            )}

            <div
                className={classNames('w-full flex justify-center items-center ', {
                    'mt-5 ': exportType === ExportType.JSON,
                    'mt-[60px] ': exportType === ExportType.URL,
                })}
            >
                <Button
                    disabled={
                        (exportType === ExportType.URL && !jsonUrl) ||
                        (exportType === ExportType.JSON && !jsonData.tags?.length)
                    }
                    type="primary"
                    size="large"
                    onClick={onCreateCodeClick}
                    className=" w-[100px] h-[38px]"
                >
                    生成
                </Button>
            </div>

            <Tooltip content="添加服务。注意：项目中有多个接口使用不同的 '前置URL' 时，需要添加多个服务。 服务名需要和接口的tag相同">
                <Button
                    className="ml-20"
                    style={{ position: 'absolute', bottom: 0, right: 24 }}
                    icon={<IconList style={{ color: 'rgb(var(--primary-6))' }} />}
                    onClick={() => setShowAddServerPop(true)}
                />
            </Tooltip>

            <AddServerPop show={showAddServerPop} onClose={() => setShowAddServerPop(false)} />
        </div>
    );
};

Generate.displayName = 'Generate';
