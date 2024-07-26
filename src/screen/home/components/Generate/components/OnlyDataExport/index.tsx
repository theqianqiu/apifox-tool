import { Input, Switch, Tooltip, Typography } from '@arco-design/web-react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import classNames from 'classnames';
import { FC, ReactElement, useContext } from 'react';
import { GlobalContext } from '../../../../../../store/globalStore';

export const OnlyDataExportCom: FC<{ classname?: string }> = ({ classname }): ReactElement => {
    const { onlyDataExport, updateOnlyDataExportInfo } = useContext(GlobalContext);

    return (
        <div className={classNames(classname, 'flex items-center my-4 ', { 'text-[#87888F]': !onlyDataExport.opend })}>
            <span className="  inline-block">返回数据字段名（默认data）:</span>
            <Input
                style={{ width: 120 }}
                defaultValue={onlyDataExport?.paramName}
                className="ml-1 mr-4"
                onChange={(value) => updateOnlyDataExportInfo({ paramName: value })}
                disabled={!onlyDataExport.opend}
            />

            <Switch checked={onlyDataExport.opend} onChange={(value) => updateOnlyDataExportInfo({ opend: value })} />

            <div className="flex items-center text-[#87888F] text-[12px]">
                <p className="ml-2 mr-1 ">注： 打开此选项后，只生成实际的数据</p>
                <Tooltip
                    content={
                        <div>
                            <div>
                                <p>例如，如果接口返回了</p>
                                <Typography.Text
                                    code
                                >{`{"code": 0, "message": "success", "data": {"name": "wanpeng", "age": 25}}`}</Typography.Text>
                                <p>,则只会导出</p>
                                <Typography.Text code>{`{"name": "wanpeng", "age": 25}`}</Typography.Text>
                            </div>
                        </div>
                    }
                >
                    <div className="cursor-pointer">
                        <IconQuestionCircle style={{ fontSize: 16, marginTop: 2 }} />
                    </div>
                </Tooltip>
            </div>
        </div>
    );
};

OnlyDataExportCom.displayName = 'OnlyDataExportCom';
