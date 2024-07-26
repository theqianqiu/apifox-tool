const request = <T>(url: string, method: string, contentType?: string, data?: T) => {
    const config = {
        method: method.toUpperCase(),
        headers: {
            'Content-Type': contentType ?? 'application/json',
        },
    } as {
        method: string;
        headers: { 'Content-Type': string };
        body?: any;
    };

    const reqmethod = method.toUpperCase();
    let dataStr = ''; // 数据拼接字符串
    if (/^(POST|PUT|PATCH)$/i.test(reqmethod)) {
        config.body = JSON.stringify(data);
    } else {
        if (!data) return;
        const keys = Object.keys(data);
        keys.forEach((key, index) => {
            dataStr += `${key}=${(data as any)[key]}${index !== keys.length - 1 ? '&' : ''}`;
        });
    }

    // 发送请求
    fetch(`${url}${dataStr ? `?${dataStr}` : ''}`, config)
        .then((response) => {
            const { status, type } = response;
            // 只要状态码是以2或者3开始的，才是真正的获取成功
            if (status >= 200 && status < 400) {
                let result;
                switch (type.toUpperCase()) {
                    case 'JSON':
                        result = response.json();
                        break;
                    case 'TEXT':
                        result = response.text();
                        break;
                    case 'BLOB':
                        result = response.blob();
                        break;
                    case 'ARRAYBUFFER':
                        result = response.arrayBuffer();
                        break;
                    default:
                        result = response.json();
                }
                return result;
            }
            return Promise.reject(response);
        })
        .catch((reason) => {
            return Promise.reject(reason);
        });
};
