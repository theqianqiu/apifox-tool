import { Button, Input, Modal, Tooltip } from '@arco-design/web-react';
import { IconMinusCircle, IconPlus, IconQuestionCircle } from '@arco-design/web-react/icon';
import { FC, ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { GlobalContext, ServiceInfo } from '../../../../../../store/globalStore';

const ServerItem: FC<{ info: ServiceInfo; index: number }> = ({ info, index }) => {
    const { updateServiceList } = useContext(GlobalContext);
    const [iteminfo, setiteminfo] = useState(info);

    useEffect(() => {
        updateServiceList(iteminfo, index);
    }, [index, iteminfo, updateServiceList]);

    return (
        <div className="flex items-center my-2">
            <Input
                style={{ width: 110, marginRight: 4 }}
                placeholder="请输入服务名（tag）"
                value={iteminfo.name}
                onChange={(val) => setiteminfo({ ...iteminfo, name: val })}
            />
            <Input
                style={{ marginRight: 6 }}
                placeholder="请输入URL"
                value={iteminfo.url}
                onChange={(val) => setiteminfo({ ...iteminfo, url: val })}
            />
            <Button
                type="text"
                icon={<IconMinusCircle style={{ fontSize: 16, color: 'rgb(var(--danger-6))' }} />}
                onClick={() => updateServiceList(iteminfo, index, true)}
            ></Button>
        </div>
    );
};

interface Props {
    show: boolean;
    onClose: () => void;
}
export const AddServerPop: FC<Props> = ({ show, onClose }): ReactElement => {
    const { serviceList, updateServiceList } = useContext(GlobalContext);

    const onAddServiceClick = useCallback(() => {
        updateServiceList({ name: '', url: '' }, -1);
    }, [updateServiceList]);

    return (
        <Modal
            title="添加服务"
            visible={show}
            onOk={() => onClose()}
            onCancel={() => onClose()}
            escToExit={false}
            maskClosable={false}
        >
            <div className="flex items-center mb-3">
                <div className="mr-20 ml-1">
                    <span className="mr-2">服务名</span>
                    <Tooltip content="服务名需与接口中的外层目录的名称一致">
                        <IconQuestionCircle style={{ fontSize: 16, cursor: 'pointer' }} />
                    </Tooltip>
                </div>
                <span>前置URL</span>
            </div>
            <div className="mb-4 max-h-[220px] overflow-y-auto">
                {serviceList.map((item, index) => (
                    <ServerItem key={index} info={item} index={index} />
                ))}
            </div>
            <Button type="text" icon={<IconPlus />} onClick={onAddServiceClick}>
                添加服务
            </Button>
        </Modal>
    );
};

AddServerPop.displayName = 'AddServerPop';
