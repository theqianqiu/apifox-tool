/* eslint-disable max-lines-per-function */
import { Message } from '@arco-design/web-react';
import axios from 'axios';
import { CustomRequest, OnlyDataExport, ServiceInfo } from '../store/globalStore';
import { FilerUtils } from './fileUtls';

interface PropertyInfo {
    type: string;
    description?: string;
    example?: string;
    items?: { [key: string]: PropertyInfo };
}

type ParamInfo = { [key: string]: PropertyInfo };

interface SchemaInfo {
    type: string;
    properties: ParamInfo;
    // 必填参数列表
    required?: string[];
    /** type 为 array 时 */
    items?: { [key: string]: PropertyInfo };
}

interface ParameterInfo {
    name: string;
    in: string;
    description: string;
    required: boolean;
    /** 在请求的 parameters 中，schema里的数据均为基础类型数据  */
    schema: PropertyInfo;
}

interface ServerInfo {
    url: string;
    description: string;
}

interface PathInfo {
    // 协议名
    summary: string;
    description: string;
    deprecated: boolean;
    tags: string[];
    // get请求中的请求参数 (只解析其中一个，有parameters就是走get,有body就是走post)
    parameters: ParameterInfo[];
    // post请求中的请求参数 (只解析其中一个，有parameters就是走get,有body就是走post)
    requestBody: {
        content: { 'application/json': { schema: SchemaInfo } };
    };
    // 返回数据
    responses: { '200': { content: { 'application/json': { schema: SchemaInfo } } } };
}
export interface JsonDataInfo {
    tags: { name: string }[];
    paths: { [key: string]: { [key: string]: PathInfo } };
    servers: ServerInfo[];
}

// 基础数据类型
const basicDataTypes = ['string', 'number', 'integer', 'boolean', 'file'];

export class Parser {
    private apiJsonFile: JsonDataInfo | undefined = undefined;
    private apiDefines = '';
    private interfaceDefines = '';
    private responseSubDefineMap: Map<string, string[]> = new Map();
    private apiImports = '';

    private apiList: string[] = [];

    // 文件保存路径
    private savepath = '';

    // 导出数据类型
    private onlyDataExport: OnlyDataExport = { opend: false, paramName: '' };
    // 自定义请求代码
    private customRequestCode: CustomRequest = { opend: false, importCode: '', requestCode: '' };
    // 服务列表
    private serverList: ServiceInfo[] = [];

    set savePath(path: string) {
        this.savepath = path;
    }

    get savePath() {
        return this.savepath;
    }

    set dataExport(data: OnlyDataExport) {
        this.onlyDataExport = data;
        console.log('set onlyDataExport: ', this.onlyDataExport);
    }

    get dataExport() {
        return this.onlyDataExport;
    }

    set customCode(data: CustomRequest) {
        this.customRequestCode = data;
        console.log('set customCode: ', this.customRequestCode);
    }

    set serviceList(list: ServiceInfo[]) {
        this.serverList = list;
        console.log('set serviceList: ', this.serverList);
    }

    start(savePath: string, url?: string, jsonData?: JsonDataInfo) {
        this.savePath = savePath;

        this.resetDefines();

        if (url) {
            console.log(' parse by url: ', url);
            this.getJsonData(url);
            return;
        }

        if (jsonData) {
            console.log(' parse by json file: ', jsonData);
            this.apiJsonFile = jsonData;
            this.createModuleCodes();
        }
    }

    private async createModuleCodes() {
        if (!this.apiJsonFile) return;
        // console.log('createModuleCodes: ', this.apiJsonFile);

        // 解析出api列表
        this.apiList = Array.from(Object.keys(this.apiJsonFile.paths));
        this.apiList.forEach((api) => {
            const data = this?.apiJsonFile?.paths[api];
            if (data) {
                const reqMethod = Array.from(Object.keys(data))[0];
                const apidata = data[reqMethod];
                const apiname = this.createAPIName(api);
                const requestApi = `${apiname}Request`;
                const responseApi = `${apiname}Response`;

                // 创建api
                this.apiDefines += this.defineAPI(
                    api,
                    requestApi,
                    responseApi,
                    apidata,
                    reqMethod,
                    this.getValueByKey(apidata?.responses, 'schema') as SchemaInfo,
                );

                // 创建请求数据结构体
                this.interfaceDefines += this.parseRequestDefine(
                    requestApi,
                    apidata?.parameters,
                    this.getValueByKey(apidata?.requestBody, 'schema') as SchemaInfo,
                );

                // 创建返回数据结构体
                this.interfaceDefines += this.parseResoneDefine(
                    responseApi,
                    this.getValueByKey(apidata?.responses, 'schema') as SchemaInfo,
                );
                // console.log('解析defines: ', this.interfaceDefines);
            }
        });

        // 写入接口文件
        this.touchAPIFile();
        this.touchInterfaceFile();

        Message.success({
            content: '接口文件生成成功! 请到指定目录查看',
            showIcon: true,
            position: 'bottom',
        });
    }

    private defineAPI(
        apiPath: string,
        requestDefine: string,
        responseDefine: string,
        apidata: PathInfo,
        reqMethod: string,
        responseData: SchemaInfo,
    ) {
        const apiname = this.createAPIName(apiPath);

        let headerContentType = apidata?.requestBody ? Object.keys(apidata?.requestBody?.content)?.[0] : '';
        headerContentType = reqMethod === 'post' && !apidata?.requestBody ? 'multipart/form-data' : headerContentType;

        const getResponseDefine = () => {
            const parserObj = this.dataExport?.opend
                ? (responseData?.properties?.[this.dataExport?.paramName || ''] as unknown as SchemaInfo) ||
                  responseData
                : responseData;
            const { type } = parserObj;
            if (!this.dataExport?.opend) return responseDefine;
            // 普通类型
            if (basicDataTypes.includes(type)) return type;
            // 复杂类型 object / array
            return type === 'array' ? `${responseDefine}[]` : responseDefine;
        };
        const respDefineName = getResponseDefine();

        if (this.customRequestCode.opend) {
            return `
/**
* ${apidata?.description || apidata?.summary || ''}
* ${apidata?.deprecated ? '@deprecated 接口已弃用' : ''}
*/
export const ${apiname} = (data${requestDefine === '{}' ? '?' : ''}: ${requestDefine}): Promise<${respDefineName}> => {
    return ${this.customRequestCode.requestCode
        .replace('@url', `'${this.getApiPre(apidata?.tags?.[0] || '')}${apiPath}'`)
        .replace('@method', `'${reqMethod}'`)
        .replace('@data', `data`)
        .replace('@contentType', `'${headerContentType || 'application/json;charset=utf-8'}'`)};
}\n`;
        }

        //         return `
        // /**
        //  * ${apidata?.description || apidata?.summary || ''}
        //  * ${apidata?.deprecated ? '@deprecated 接口已弃用' : ''}
        //  */
        // export const ${apiname} = (data${requestDefine === '{}' ? '?' : ''}: ${requestDefine}): Promise<${respDefineName}> => {
        //     return NetManager.inst.request('${this.getApiPre(apidata?.tags?.[0] || '')}${apiPath}', '${reqMethod}', data, '${
        //             headerContentType || 'application/json;charset=utf-8'
        //         }');
        // }\n`;
        return `
/**
 * ${apidata?.description || apidata?.summary || ''}
 * ${apidata?.deprecated ? '@deprecated 接口已弃用' : ''}
 */
export const ${apiname} = (data${requestDefine === '{}' ? '?' : ''}: ${requestDefine}): Promise<${respDefineName}> => {
    return new Promise((resolve, reject) => {
        axios({
          method: '${reqMethod}',
          url: '${this.getApiPre(apidata?.tags?.[0] || '')}${apiPath}',
          ${reqMethod === 'get' ? 'params' : 'data'}: data,
          headers: { "Content-Type":'${headerContentType || 'application/json;charset=utf-8'}' },
        })
          .then((res) => resolve(${
              this.onlyDataExport?.opend ? `res['${this.onlyDataExport?.paramName ?? 'data'}']` : 'res ?? ""'
          }))
          .catch((err) => {
            reject(err);
          });
      });
}\n`;
    }

    // 解析请求数据结构体
    private parseRequestDefine(api: string, parameters?: ParameterInfo[], requestBody?: SchemaInfo) {
        // console.log('parseRequestDefine: ', api, parameters, requestBody);

        let defines = '';

        // 读取 parameters 对象
        if (parameters?.length) {
            const params = parameters?.filter((val) => val?.in !== 'header'); // 放进header中的参数这边不解析
            // console.log(`解析: ${api}, parameters:`, params);
            for (let i = 0; i < params?.length; i += 1) {
                const obj = params[i];
                // parameters 里的参数只能配置基础数据类型，例如： string, number, boolean
                defines += this.createParam(obj.name, obj.description, obj.schema.type, obj.required);
            }
        }

        // 读取 requestBody 对象
        if (requestBody?.properties) {
            defines += this.parseObjectStruct(requestBody, api);
        }

        const subDefines = this.responseSubDefineMap.get(api) || [];

        this.apiImports += `
import { ${api} } from './Interface';\n`;

        return `export interface ${api} {
            ${defines}
}\n
${subDefines.join('\n')}
`;
    }

    // 解析返回数据结构体
    private parseResoneDefine(api: string, response: SchemaInfo) {
        const parserObj = this.dataExport?.opend
            ? (response?.properties?.[this.dataExport?.paramName || ''] as unknown as SchemaInfo) || response
            : response;
        const defines = this.parseObjectStruct(parserObj, api);
        const subDefines = this.responseSubDefineMap.get(api) || [];

        // console.log('parseResoneDefine: ', api, defines, subDefines);

        this.apiImports += `import { ${api} } from './Interface';`;

        return `export interface ${api} {
            ${defines}
}\n
${subDefines.join('\n')}
`;
    }

    private parseObjectStruct(param: SchemaInfo, api: string) {
        const { properties, items, required, type } = param;

        // 普通类型
        if (basicDataTypes.includes(type)) {
            const paramname = this.dataExport?.opend ? this.dataExport?.paramName || 'data' : 'data';
            return this.createParam(paramname, '', type, param?.required?.includes(paramname) ?? false);
        }

        const createSubDefine = (name: string, subparams: SchemaInfo) => {
            return `export interface ${name} {
                ${this.parseObjectStruct(subparams, api)}
}
`;
        };

        // 复杂类型
        let params: string[] = [];
        let propertyObj = properties;
        if (type === 'object') {
            params = Object.keys(properties ?? {});
        } else if (type === 'array') {
            params = Object.keys(items?.properties || {});
            propertyObj = (items?.properties || ({} as ParamInfo)) as ParamInfo;
        }

        if (!params.length) return '';

        const subDefines = api ? this.responseSubDefineMap.get(api) || [] : [];

        let defines = '';
        params.forEach((key) => {
            const obj = propertyObj[key];
            const desc = `${obj?.description || ''} ${obj?.example ? 'expamle: ' : ''}${obj?.example || ''}`;
            const require = required?.includes?.(key) || false;

            // 普通数据类型
            if (basicDataTypes.includes(obj.type)) {
                defines += this.createParam(key, desc, obj.type, require);
            } else {
                // 复杂数据格式， object 和 array ， 需要继续往下一层解析
                const subParamName = `${api?.replace(/Request|Response|/g, '')}${this.firstUpperCase(key)}`;

                // 对象类型解析
                if (obj.type === 'object') {
                    defines += this.createParam(key, desc, subParamName, require);
                    subDefines.push(createSubDefine(subParamName, obj as unknown as SchemaInfo));
                }

                // 数组类型解析
                if (obj.type === 'array') {
                    const isBasicType = basicDataTypes.includes(`${obj?.items?.type}` || '');
                    defines += this.createParam(
                        key,
                        desc,
                        isBasicType ? `${obj?.items?.type}[]` : `${subParamName}[]`,
                        require,
                    );

                    if (!isBasicType) {
                        subDefines.push(createSubDefine(subParamName, obj as unknown as SchemaInfo));
                    }
                }
            }
            if (api) this.responseSubDefineMap.set(api, subDefines);
        });

        return defines;
    }

    private createParam(key: string, desc: string, dataType: string, required: boolean) {
        let datatype = dataType;
        switch (dataType) {
            case 'integer':
                datatype = 'number';
                break;
            case 'file':
                datatype = 'File';
                break;
            default:
        }
        return `
    /** ${desc || ''} */
    ${key}${required ? '' : '?'}: ${datatype};\n`;
    }

    // 创建api文件

    private async touchAPIFile() {
        const isDefault = !this.customRequestCode.opend;
        // 'import { NetManager } from "@vgene/utils"'
        const final = `${isDefault ? `import axios from 'axios'` : this.customRequestCode.importCode};
    ${this.apiImports}
    ${this.apiDefines}`;
        await FilerUtils.saveTextFile(`${this.savePath}/Apis.ts`, final);
    }

    // 创建Interface文件
    private async touchInterfaceFile() {
        await FilerUtils.saveTextFile(`${this.savePath}/Interface.ts`, this.interfaceDefines);
    }

    //  读取服务列表， 不同服务api前缀不同
    private getApiPre(tag: string) {
        return this.serverList?.find?.((server) => server.name.includes(tag) || tag.includes(server.name))?.url || '';

        // if (!this.apiJsonFile?.servers?.length) return { pre: '', suf: '' };

        // return { pre: this.apiJsonFile.servers.find((server) => server.description.includes(tag))?.url || '', suf: '' };
    }

    // 将 'user/login' 类型的接口名解析成驼峰式 UserLogin
    private createAPIName(api: string) {
        const apiname = api
            .split('/')
            .map((str) => {
                if (str.includes('-')) {
                    return str
                        .split('-')
                        .map((subStr) => {
                            return this.firstUpperCase(subStr);
                        })
                        .join('');
                }
                return this.firstUpperCase(str);
            })
            .join('');

        return apiname;
    }

    private resetDefines() {
        this.apiDefines = '';
        this.interfaceDefines = '';
        this.apiImports = '';
        this.responseSubDefineMap.clear();
        this.apiList = [];
    }

    private getJsonData(url: string) {
        axios
            .get(url)
            .then((response) => {
                // 检查HTTP响应状态
                if (response.status === 200) {
                    // 响应数据包含在response.data中，它已经是JSON格式的对象
                    const jsonData = response.data;
                    this.apiJsonFile = jsonData;
                    this.createModuleCodes();
                } else {
                    Message.error({
                        content: 'JSON文件下载失败，请检查网络连接或URL地址是否正确。',
                        showIcon: true,
                        position: 'bottom',
                    });
                    console.error('Failed to download JSON file. HTTP Status:', response.status);
                }
            })
            .catch((error) => {
                console.error('Error downloading JSON file:', error);
            });
    }

    private firstUpperCase(str: string) {
        return str.replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
    }

    private getValueByKey<T>(obj: { [key: string]: T }, targetKey: string): unknown {
        if (!obj) return '';
        let result;
        // 检查当前对象是否包含目标 key
        if (obj[targetKey]) {
            return obj[targetKey];
        }

        // 遍历对象的所有属性
        const keys = Array.from(Object.keys(obj));
        for (let i = 0; i < keys.length; i += 1) {
            const key = keys[i];
            if (Object.hasOwn(obj, key) && typeof obj[key] === 'object') {
                // 如果属性的值是一个对象，则进行递归调用
                result = this.getValueByKey(obj[key] as { [key: string]: T }, targetKey);
                // 如果找到目标值，立即返回
                if (result !== undefined) break;
            }
        }

        // 如果未找到目标值，返回 undefined
        return result;
    }
}
