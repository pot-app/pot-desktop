export enum ServiceSourceType {
    BUILDIN = 'buildin',
    PLUGIN = 'plugin',
}

export function getServiceSouceType(serviceInstanceKey: string): ServiceSourceType {
    if (serviceInstanceKey.startsWith('[plugin]')) {
        return ServiceSourceType.PLUGIN
    } else {
        return ServiceSourceType.BUILDIN
    }
}

export function whetherPluginService(serviceInstanceKey: string): boolean {
    return getServiceSouceType(serviceInstanceKey) === ServiceSourceType.PLUGIN
}

export function getServiceName(serviceInstanceKey: string): string {
    return serviceInstanceKey.split('@')[0]
}