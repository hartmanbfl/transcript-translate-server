import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Tenant } from "./Tenant.entity.js";

@Entity({ name: "main_database_file"})
export class DatabaseFile {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant 

    @Column()
    filename: string;

    @Column({ type: "bytea"})
    data: Uint8Array;
}