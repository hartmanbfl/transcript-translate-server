import { getChurchAdditionalWelcome, getChurchDefaultServiceId, getChurchGreeting, getChurchLanguage, getChurchLogoBase64, getChurchMessage, getChurchName, getChurchServiceTimeout, getChurchTranslationLanguages, getChurchWaitingMessage } from '../repositories/church.repository.js';
import { serviceLanguageMap, serviceSubscriptionMap, streamingStatusMap } from '../repositories/index.repository.js';
import { ChurchActiveLanguages, ChurchInfo, LanguageEntry } from '../types/church.types.js';
import { ApiResponseType } from '../types/apiResonse.types.js';
import { getClientIo } from './socketio.service.js';
import { Server } from 'socket.io';
import { AppDataSource } from '../data-source.js';
import { AppThemingData } from '../entity/AppThemingData.entity.js';
import { ChurchProperties } from '../entity/ChurchProperties.entity.js';
import { DatabaseFilesService } from './databaseFiles.service.js';
import { Tenant } from '../entity/Tenant.entity.js';
import { fileTypeFromBuffer } from 'file-type';

export class ChurchService {
    static async getChurchInfo(tenantId: string): Promise<ApiResponseType<ChurchInfo>> {
        try {
            console.log(`Attempting to get the themes for tenant: ${tenantId}`);
            const theme = await AppDataSource
                .getRepository(AppThemingData)
                .createQueryBuilder('theme')
                .innerJoinAndSelect('theme.tenant', 'tenant')
                .innerJoinAndSelect('theme.logo', 'logo')
                .where('tenant.id = :tenantId', { tenantId })
                .getOne();
            if (!theme) throw new Error(`No theme defined for this tenant`);    

            console.log(`Retrieved theme for ${theme.tenant.name}`);

            const properties = await AppDataSource
                .getRepository(ChurchProperties)
                .createQueryBuilder('properties')
                .innerJoin('properties.tenant', 'tenant')
                .where('tenant.id = :tenantId', { tenantId })
                .getOne();
            if (!properties) throw new Error(`No properties defined for this tenant`);   

            const base64String: string | null = (theme.logo) ? DatabaseFilesService.convertByteaToBase64(theme.logo.data) : null; 

            let base64Logo: string = "";
            if (base64String) {
                const b64buffer = Buffer.from(base64String, "base64");
                const fileInfo = await fileTypeFromBuffer(b64buffer);
                const extType = fileInfo?.ext;
                const mimeType = fileInfo?.mime;
                // Append the base64 data string
                base64Logo = `data:${mimeType};base64,${base64String}`;
            }


            return {
                success: true,
                statusCode: 200,
                message: `Info generated successfully`,
                responseObject: {
                    name: theme.tenant.name,
                    defaultServiceId: properties.defaultServiceId.toString(),
                    greeting: theme.greeting,
                    message: theme.message,
                    additionalWelcome: theme.additional_welcome_message,
                    waiting: theme.waiting_message,
                    language: properties.defaultLanguage,
                    translationLanguages: properties.translationLanguages,
                    base64Logo: base64Logo
                }
            }
        } catch (error) {
            return {
                success: false,
                statusCode: 400,
                message: `Error getting church info: ${error}`,
                responseObject: null
            }
        }
    }
    static async getChurchConfiguration(tenantId: string ) {
        try {
            const configuration = await AppDataSource
                .getRepository(ChurchProperties)
                .createQueryBuilder('configuration')
                .innerJoinAndSelect('configuration.tenant', 'tenant')
                .where('tenant.id = :tenantId', { tenantId })
                .getOne();
            if (!configuration) throw new Error(`No configuration found for this tenant`);

            return {
                success: true,
                statusCode: 200,
                message: `Configuration generated successfully`,
                responseObject: {
                    serviceTimeout: configuration.serviceTimeoutInMin,
                    churchName: configuration.tenant.name,
                    defaultServiceId: configuration.defaultServiceId,
                    hostLanguage: configuration.defaultLanguage
                }
            }
        } catch (error) {
            console.log(`Error: ${error}`)
            return {
                success: false,
                statusCode: 400,
                message: `Properties not retrieved successfully`,
                responseObject: null 
            }
        }
    }
    static async setChurchProperties(tenantId: string, info: Partial<ChurchProperties>) {
        try {
            const tenantRepository = AppDataSource.getRepository(Tenant);
            const propsRepository = AppDataSource.getRepository(ChurchProperties);

            // Get the tenant
            const tenant = await tenantRepository.findOne({where: {id: tenantId}});
            if (!tenant) throw new Error(`setChurchProperties: Tenant not found for this tenant ID`);

            // Check if properties already exists for this tenant
            let churchProps = await propsRepository.findOne({ where: { tenant: { id: tenantId} }});

            if (!churchProps) {
                churchProps = propsRepository.create(info);
                churchProps.tenant = tenant; 
            } else {
                // update existing props with new data
                propsRepository.merge(churchProps, info);
            }

            // Save the change in DB
            await propsRepository.save(churchProps);


            return {
                success: true,
                statusCode: 200,
                message: `Properties set successfully`,
                responseObject: churchProps 
            }
        } catch (error) {
            console.log(`Error: ${error}`)
            return {
                success: false,
                statusCode: 400,
                message: `Properties not set successfully`,
                responseObject: null 
            }
        }
    }
}

export const infoService = (): ApiResponseType<ChurchInfo> => {
    try {
        const churchName = getChurchName();
        const churchLogoBase64 = getChurchLogoBase64();
        const churchGreeting = getChurchGreeting();
        const churchMessage = getChurchMessage();
        const churchWaitingMessage = getChurchWaitingMessage();
        const churchAdditionalWelcome = getChurchAdditionalWelcome();
        const churchLang = getChurchLanguage();
        const defaultServiceId = getChurchDefaultServiceId();
        const translationLanguages = getChurchTranslationLanguages();
        return {
            success: true,
            statusCode: 200,
            message: `Info generated successfully`,
            responseObject: {
                name: churchName, defaultServiceId: defaultServiceId,
                greeting: churchGreeting,
                message: churchMessage, additionalWelcome: churchAdditionalWelcome,
                waiting: churchWaitingMessage,
                language: churchLang, translationLanguages: translationLanguages,
                base64Logo: churchLogoBase64
            }
        }
    } catch (error) {
        return {
            success: false,
            statusCode: 400,
            message: `Error getting church info`,
            responseObject: null
        }
    }
}
export const configurationService = () => {
    try {
        return {
            success: true,
            statusCode: 200,
            message: `Configuration generated successfully`,
            responseObject: {
                serviceTimeout: getChurchServiceTimeout(),
                churchName: getChurchName(),
                defaultServiceId: getChurchDefaultServiceId(),
                hostLanguage: getChurchLanguage()
            }
        }
    } catch (error) {
        return {
            success: false,
            statusCode: 400,
            message: `Error: ${error}`,
            responseObject: {
                error: error
            }
        }
    }
}
export const statusService = (serviceId: string) => {
    try {
        // See if this service ID exists in the service map
        const active = serviceSubscriptionMap.get(serviceId);
        if (process.env.EXTRA_DEBUGGING) console.log(`Checking if ${serviceId} exists in the serviceSubscriptionMap: ${active}`);
        return {
            success: true,
            statusCode: 200,
            message: `Service is currently ${active}`,
            responseObject: {
                active: active
            }
        }
    } catch (error) {
        return {
            success: false,
            statusCode: 400,
            message: `Error: ${error}`,
            responseObject: {
                error: error
            }
        }
    }
}
export const getLivestreamStatus = (serviceId: string) => {
    try {
        const streamingStatus = streamingStatusMap.get(serviceId);
        return {
            success: true,
            statusCode: 200,
            message: `Streaming Status for service ${serviceId}`,
            responseObject: {
                status: streamingStatus
            }
        }
    } catch (error) {
        console.error(`ERROR getting streaming status: ${error}`);
        return {
            success: false,
            statusCode: 400,
            message: `Failed to get Streaming Status for service ${serviceId}`,
            responseObject: {
                error: error
            }
        }
    }
}
export const getLanguages = (serviceId: string) => {
    try {
        const clientIo = getClientIo();
        const jsonString = getActiveLanguages(clientIo, serviceId);
        return {
            success: true,
            statusCode: 200,
            message: `Successfully obtained languages for service: ${serviceId}`,
            responseObject: jsonString
        }
    } catch (error) {
        console.log(`Error getting subscribers for service: ${error}`);
        return {
            success: false,
            statusCode: 400,
            message: `Error obtaining languages for service: ${serviceId}`,
            responseObject: {
                error: error
            }
        }
    }
}

export const getActiveLanguages = (io: Server, serviceId: string) => {
    //    const jsonData = {
    //        serviceId: serviceId,
    //        languages: []
    //    };
    const activeLanguages: ChurchActiveLanguages = {
        serviceId: serviceId,
        languages: []
    }

    // Get the number of subscribers to the transcript
    const transcriptRoom: string = `${serviceId}:transcript`;
    const transcriptRoomObj = io.sockets.adapter.rooms.get(transcriptRoom);
    const transcriptSubscribers: number = (transcriptRoomObj == undefined) ? 0 : transcriptRoomObj.size;

    // Get the languages currently active 
    const langArray = serviceLanguageMap.get(serviceId);
    if (langArray == undefined || langArray.length == 0 && transcriptSubscribers == 0) {
        //        return { result: "There are no languages currently being subscribed to." };
        return (activeLanguages);
    }

    // First put in transcript subscribers
    activeLanguages.languages.push({
        name: "Transcript",
        subscribers: transcriptSubscribers
    });

    // Get the number of subscribers for each of the languages
    for (let language in langArray) {
        const room: string = `${serviceId}:${langArray[language]}`;
        const clients: number | undefined = io?.sockets?.adapter?.rooms?.get(room)?.size;
        const languageEntry: LanguageEntry = {
            name: langArray[language],
            subscribers: (clients == undefined) ? 0 : clients
        };
        activeLanguages.languages.push(languageEntry);
    }

    return (activeLanguages);
}
