import { AppDataSource } from "../data-source.js";
import { Session } from "../entity/Session.entity.js";
import { Subscriber } from "../entity/Subscriber.entity.js";
import { ApiResponseType } from "../types/apiResonse.types.js";

export class SubscriberService {
    static async subscriberAdded(sessionId: string, room: string, userAgent: string, socketId: string): Promise<string|null> {
        try {
            const subscriberRepository = AppDataSource.getRepository(Subscriber);
            const session = await AppDataSource.getRepository(Session)
                .createQueryBuilder('session')
                .innerJoinAndSelect('session.tenant', 'tenant')
                .where('session.id = :sessionId', { sessionId })
                .getOne();

            if (!session) throw new Error(`Session not found for this ID`);

            const subscriber = new Subscriber();
            subscriber.room = room;
            subscriber.tenant_id = session.tenant.id; 
            subscriber.user_agent = userAgent; 
            subscriber.socket_id = socketId;
            subscriber.session = session; 
            const update = await subscriberRepository.save(subscriber); 
            return update.id;
        } catch (error) {
            console.log(`Error in subscriberAdded: ${error}`);
            return null;
        }
    }
    static async subscriberRemoved(id: string) {
        try {
            const subscriberRepository = AppDataSource.getRepository(Subscriber);
            const subscriber = await subscriberRepository.findOne({where: {id: id}});
            if (!subscriber) throw new Error(`Subscriber not found with this ID`);

            subscriber.ended_at = new Date();
            await subscriberRepository.save(subscriber);
            
        } catch (error) {
            console.log(`Error in subscriberRemoved: ${error}`);
        }
    }
    static async getSubscriberBySocketId(socketId: string, room: string): Promise<string|null> {
        try {
            const subscriberRepository = AppDataSource.getRepository(Subscriber);
            const subscriber = await subscriberRepository
                .createQueryBuilder()
                .where('socket_id = :socketId', { socketId })
                .andWhere('room = :room', { room })
                .getOne();

            if (!subscriber) throw new Error(`Subscriber not found for this socket ID`);
            
            return subscriber.id;
        } catch (error) {
            console.log(`Error in getSubscriberBySocketId: ${error}`);
            return null;
        }
    }
    static async getSubscribers(tenantId: string): Promise<ApiResponseType<Subscriber[]>> {
        try {
            const subscriberRepository = AppDataSource.getRepository(Subscriber);
            const subscribers = await subscriberRepository
                .createQueryBuilder('subsriber')
                .innerJoinAndSelect('subscriber.tenant', 'tenant')
                .where('tenant.id = :tenantId', { tenantId })
                .getMany();

            return {
                success: true,
                statusCode: 200,
                message: `Found ${subscribers.length} subscribers for tenant ${tenantId}`,
                responseObject: subscribers
            }    


        } catch (error) {
            console.log(`Error in getSubscribers: ${error}`);
            return {
                success: false,
                statusCode: 400,
                message: `${error}`,
                responseObject: []
            }
        }
    }
    static async getSubscribersToService(tenantId: string, serviceId: string): Promise<ApiResponseType<Subscriber[]>> {
        try {
            const subscriberRepository = AppDataSource.getRepository(Subscriber);
            const subscribers = await subscriberRepository
                .createQueryBuilder('subsriber')
                .innerJoinAndSelect('subscriber.tenant', 'tenant')
                .where('tenant.id = :tenantId', { tenantId })
                .andWhere('service_id = :serviceId', { serviceId })
                .getMany();

            return {
                success: true,
                statusCode: 200,
                message: `Found ${subscribers.length} subscribers to service ${serviceId}`,
                responseObject: subscribers
            }    


        } catch (error) {
            console.log(`Error in getSubscribers: ${error}`);
            return {
                success: false,
                statusCode: 400,
                message: `${error}`,
                responseObject: []
            }
        }
    }
}