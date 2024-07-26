import { Input, Switch, Tooltip } from '@arco-design/web-react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import classNames from 'classnames';
import { FC, ReactElement, useContext } from 'react';
import { GlobalContext } from '../../../../../../store/globalStore';

export const CustomRequestOption: FC<{ classname?: string }> = ({ classname }): ReactElement => {
    const { customRequest, updateCustomRequestInfo } = useContext(GlobalContext);

    return (
        <div className={classname}>
            <div className="flex items-center mb-2">
                <p
                    className={classNames('mr-2', {
                        'text-[#87888F]': !customRequest.opend,
                    })}
                >
                    自定义请求代码
                </p>
                <Switch checked={customRequest.opend} onChange={(value) => updateCustomRequestInfo({ opend: value })} />
                <p className="ml-2 text-[#87888F] text-[12px] ">
                    注：此选项可配置自己项目中的请求代码。默认不开启，使用axios请求。
                </p>
            </div>

            <div
                className={classNames('flex items-center mb-4', {
                    'hidden text-[#87888F]': !customRequest.opend,
                    block: customRequest.opend,
                })}
            >
                <span className="mr-2 w-20">import代码</span>
                <Input
                    style={{ width: 460 }}
                    placeholder='import axios from "axios";'
                    className="ml-1 mr-4"
                    value={customRequest?.importCode || ''}
                    onChange={(value) => updateCustomRequestInfo({ importCode: value })}
                    disabled={!customRequest.opend}
                />
            </div>

            <div
                className={classNames('flex items-center mb-4', {
                    hidden: !customRequest.opend,
                    block: customRequest.opend,
                })}
            >
                <div className="mr-2">
                    <span className="mr-2 w-20">请求代码</span>
                    <Tooltip content="请用@url, @method, @data, @contentType替换代码里的实际参数">
                        <IconQuestionCircle
                            style={{ fontSize: 16, marginTop: 2, color: '#87888F', cursor: 'pointer' }}
                        />
                    </Tooltip>
                </div>
                <Input.TextArea
                    style={{ width: 460 }}
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    placeholder={`axios({
                        url: @url,
                        method: @method,
                        data: @data,
                        headers: { 'content-type': @contentType },
                      })`}
                    value={customRequest?.requestCode || ''}
                    className="ml-1 mr-4"
                    onChange={(value) => updateCustomRequestInfo({ requestCode: value })}
                    disabled={!customRequest.opend}
                />
            </div>
        </div>
    );
};

CustomRequestOption.displayName = 'CustomRequestOption';
