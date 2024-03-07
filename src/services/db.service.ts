import { Repository, SelectQueryBuilder, ObjectLiteral } from "typeorm";

export class DbService {

    static async searchRecordsWithDateRange<T extends ObjectLiteral>(
        tenantId: string,
        repository: Repository<T>,
        searchCriteria: Partial<T>,
        startDate?: Date,
        endDate?: Date
    ): Promise<T[]> {
        const queryBuilder: SelectQueryBuilder<T> = repository.createQueryBuilder('record');

        // Make sure this is the correct tenant
        queryBuilder
            .innerJoinAndSelect('record.tenant', 'tenant')
            .where('tenant.id = :tenantId', { tenantId })

        Object.entries(searchCriteria).forEach(([key, value]) => {
            if (value !== undefined) {
                console.log(`Key: ${key}, value: ${value}`);
                queryBuilder.andWhere(`record.${key} = :${key}`, { [key]: value });
            }
        });

        if (startDate && endDate) {
            queryBuilder.andWhere('record.created_at BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        }
        return queryBuilder.getMany();
    } 

}