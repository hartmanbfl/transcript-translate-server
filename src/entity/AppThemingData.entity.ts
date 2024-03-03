import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne, Relation } from "typeorm";
import { Tenant } from "./Tenant.entity.js";
import { DatabaseFile } from "./DatabaseFile.entity.js";

@Entity({ name: "main_theming_data" })
export class AppThemingData {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @OneToOne(() => Tenant, (tenant) => tenant.app_theming_data)
    @JoinColumn({ name: 'tenant_id'})  // this will change the following to tenant_id in the DB 
    tenant: Tenant;

    @Column({ nullable: true })
    greeting: string;

    @Column({ nullable: true })
    message: string;

    @Column({ nullable: true })
    additional_welcome_message: string;

    @Column({ nullable: true })
    waiting_message: string;

    @JoinColumn({ name: 'logoId' })
    @OneToOne(() => DatabaseFile, { nullable: true })
    logo?: Relation<DatabaseFile>;

    @Column({ nullable: true })
    logoId?: string;
}