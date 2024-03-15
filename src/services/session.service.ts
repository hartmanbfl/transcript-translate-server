import { AppDataSource } from "../data-source.js";
import { Session } from "../entity/Session.entity.js";
import { Tenant } from "../entity/Tenant.entity.js";
import { ApiResponseType } from "../types/apiResonse.types.js";

export class SessionService {
    static async startNewSession(tenantId: string, serviceId: string): Promise<string | null> {
        try {
            const sessionRepository = AppDataSource.getRepository(Session);
            const tenant = await AppDataSource
                .getRepository(Tenant)
                .findOne({ where: { id: tenantId } });
            if (!tenant) throw new Error(`Tenant not found for this ID`);    

            const session = new Session();
            session.tenant = tenant;
            session.status = "READY";
            session.service_id = serviceId;
            const updatedSession = await sessionRepository.save(session); 
            return updatedSession.id;
        } catch (error) {
            console.log(`Error in startNewSession: ${error}`);
            return null;
        }
    }
    static async endSession(sessionId: string) {
        try {
            const sessionRepository = AppDataSource.getRepository(Session);
            const session = await sessionRepository
                .findOne({where: { id: sessionId}});
            if (!session) throw new Error(`Session not found with this session ID`);    

            session.status = "ENDED";
            session.ended_at = new Date();
            sessionRepository.save(session);

        } catch (error) {
            console.log(`Error in endSession: ${error}`);
        }
    }
    static async updateStatus(sessionId: string, status: string) {
        try {
            const sessionRepository = AppDataSource.getRepository(Session);
            const session = await sessionRepository
                .findOne({where: { id: sessionId}});
            if (!session) throw new Error(`Session not found with this session ID`);    

            session.status = status; 
            sessionRepository.save(session);

        } catch (error) {
            console.log(`Error in endSession: ${error}`);
        }
    }
}