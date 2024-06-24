export enum ServiceType {
    TRANSLATE = 'translate',
    RECOGNIZE = 'recognize',
    TTS = 'tts',
    COLLECTION = 'collection',
}

export enum ServiceSourceType {
    BUILDIN = 'buildin',
    PLUGIN = 'plugin',
}

export function getServiceSouceType(serviceInstanceKey: string): ServiceSourceType {
    if (serviceInstanceKey.startsWith('plugin')) {
        return ServiceSourceType.PLUGIN;
    } else {
        return ServiceSourceType.BUILDIN;
    }
}

export function whetherPluginService(serviceInstanceKey: string): boolean {
    return getServiceSouceType(serviceInstanceKey) === ServiceSourceType.PLUGIN;
}

// The serviceInstanceKey consists of the service name and it's id, separated by @
// In earlier versions, the @ separator and id were optional, so they all have only one instance.
export function createServiceInstanceKey(serviceName: string): string {
    const randomId = Math.random().toString(36).substring(2);
    return `${serviceName}@${randomId}`;
}

// if the serviceInstanceKey is from a plugin, serviceName is it's pluginId
export function getServiceName(serviceInstanceKey: string): string {
    return serviceInstanceKey.split('@')[0];
}

export function getDisplayInstanceName(instanceName: string, serviceNameSupplier: () => string): string {
    return instanceName || serviceNameSupplier();
}

export const INSTANCE_NAME_CONFIG_KEY = 'instanceName';

export function whetherAvailableService(
    serviceInstanceKey: string,
    availableServices: Record<ServiceSourceType, Record<string, any>>
) {
    const serviceSourceType = getServiceSouceType(serviceInstanceKey);
    const serviceName = getServiceName(serviceInstanceKey);
    return availableServices[serviceSourceType]?.[serviceName] !== undefined;
}
