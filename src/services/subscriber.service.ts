import { AppDataSource } from "../data-source";
import { Subscriber } from "../entity/Subscriber.entity.js";

export class SubscriberService {
    static async subscriberAdded(subscriberData: Partial<Subscriber>) {
        try {
            const subscriberRepository = AppDataSource.getRepository(Subscriber);
            const subscriber = new Subscriber();
            subscriber.language = subscriberData.language!;
            subscriber.tenant_id = subscriberData.tenant_id!;
            subscriber.user_agent = subscriberData.user_agent!;
            subscriber.session = subscriberData.session!;
            await subscriberRepository.save(subscriber); 
        } catch (error) {
            console.log(`Error in subscriberAdded: ${error}`);
        }
    }
    static async subscriberRemoved(id: string) {
        try {
            const subscriberRepository = AppDataSource.getRepository(Subscriber);
            const subscriber = await subscriberRepository.findOne({where: {id: id}});
            if (!subscriber) throw new Error(`Subscriber not found with this ID`);

            subscriber.ended_at = new Date();
            
        } catch (error) {
            console.log(`Error in subscriberRemoved: ${error}`);
        }
    }
}